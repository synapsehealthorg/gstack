-- Complete marketplace lifecycle: discovery, favorites, private invitations,
-- RFQ questions, bid revisions, moderation, and atomic bid acceptance.

alter table public.inquiries
  add column if not exists archived_at timestamptz;

alter table public.bids
  add column if not exists revision integer default 1,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists shortlisted boolean default false,
  add column if not exists counter_unit_price numeric,
  add column if not exists counter_tat_days integer,
  add column if not exists counter_message text;

alter table public.manufacturer_profiles
  add column if not exists lead_time_days integer,
  add column if not exists price_range text,
  add column if not exists rating numeric default 0,
  add column if not exists review_count integer default 0;

alter table public.profiles
  add column if not exists account_status text default 'active' check (account_status in ('active', 'under_review', 'suspended'));

-- Security-definer avoids recursive profile RLS checks and does not depend on
-- optional custom JWT claims being configured in every environment.
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and user_type = 'admin'
  );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.handle_marketplace_user_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role text;
  selected_name text;
begin
  selected_role := case when new.raw_user_meta_data->>'user_type' = 'manufacturer' then 'manufacturer' else 'buyer' end;
  selected_name := coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1));
  insert into public.profiles (id, email, full_name, user_type)
  values (new.id, new.email, selected_name, selected_role)
  on conflict (id) do nothing;
  if selected_role = 'manufacturer' then
    insert into public.manufacturer_profiles (id, company_name)
    values (new.id, selected_name || ' Company') on conflict (id) do nothing;
  else
    insert into public.buyer_profiles (id) values (new.id) on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_marketplace_user_created on auth.users;
create trigger on_marketplace_user_created
after insert on auth.users
for each row execute function public.handle_marketplace_user_signup();

-- Repair accounts created before the profile trigger existed.
insert into public.profiles (id, email, full_name, user_type)
select u.id, u.email, coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)),
  case when u.raw_user_meta_data->>'user_type' = 'manufacturer' then 'manufacturer' else 'buyer' end
from auth.users u
where u.email is not null
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-files',
  'marketplace-files',
  true,
  15728640,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$ begin
  create policy "Authenticated users upload marketplace files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'marketplace-files' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Owners delete marketplace files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'marketplace-files' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.marketplace_favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, inquiry_id)
);

create table if not exists public.inquiry_invitations (
  id uuid primary key default uuid_generate_v4(),
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  manufacturer_id uuid references public.profiles(id) on delete cascade,
  invited_by uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'viewed', 'accepted', 'declined')),
  created_at timestamptz default now(),
  responded_at timestamptz,
  unique (inquiry_id, manufacturer_id)
);

create table if not exists public.inquiry_messages (
  id uuid primary key default uuid_generate_v4(),
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  attachment_urls text[] default '{}',
  parent_id uuid references public.inquiry_messages(id) on delete cascade,
  created_at timestamptz default now(),
  edited_at timestamptz
);

create index if not exists marketplace_favorites_user_idx on public.marketplace_favorites (user_id, created_at desc);
create index if not exists inquiry_invitations_manufacturer_idx on public.inquiry_invitations (manufacturer_id, status);
create index if not exists inquiry_messages_inquiry_idx on public.inquiry_messages (inquiry_id, created_at);
create index if not exists inquiries_marketplace_idx on public.inquiries (status, visibility, created_at desc) where archived_at is null;
create unique index if not exists bids_inquiry_manufacturer_unique on public.bids (inquiry_id, manufacturer_id);

alter table public.marketplace_favorites enable row level security;
alter table public.inquiry_invitations enable row level security;
alter table public.inquiry_messages enable row level security;
alter table public.disputes enable row level security;
alter table public.manufacturer_profiles enable row level security;

do $$ begin
  create policy "Public reads verified manufacturer profiles"
  on public.manufacturer_profiles for select
  using (verified or id = auth.uid() or public.is_platform_admin());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Manufacturers create own profile"
  on public.manufacturer_profiles for insert
  with check (id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Manufacturers update own profile"
  on public.manufacturer_profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users manage own marketplace favorites"
  on public.marketplace_favorites for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Invitation parties can read invitations"
  on public.inquiry_invitations for select using (
    manufacturer_id = auth.uid() or invited_by = auth.uid() or
    exists (select 1 from public.inquiries i where i.id = inquiry_id and i.buyer_id = auth.uid())
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Buyers invite manufacturers to own inquiries"
  on public.inquiry_invitations for insert with check (
    invited_by = auth.uid() and
    exists (select 1 from public.inquiries i where i.id = inquiry_id and i.buyer_id = auth.uid())
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Manufacturers respond to own invitations"
  on public.inquiry_invitations for update
  using (manufacturer_id = auth.uid())
  with check (manufacturer_id = auth.uid());
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Eligible users read inquiry questions"
  on public.inquiry_messages for select using (
    exists (
      select 1 from public.inquiries i
      where i.id = inquiry_id and (
        i.visibility = 'market' or i.buyer_id = auth.uid() or
        exists (select 1 from public.inquiry_invitations inv where inv.inquiry_id = i.id and inv.manufacturer_id = auth.uid())
      )
    )
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Eligible users ask inquiry questions"
  on public.inquiry_messages for insert with check (
    author_id = auth.uid() and exists (
      select 1 from public.inquiries i
      where i.id = inquiry_id and (
        i.buyer_id = auth.uid() or i.visibility = 'market' or
        exists (select 1 from public.inquiry_invitations inv where inv.inquiry_id = i.id and inv.manufacturer_id = auth.uid())
      )
    )
  );
exception when duplicate_object then null;
end $$;

-- Private RFQs are visible only to the buyer, invitees, and admins.
drop policy if exists "Active inquiries are public" on public.inquiries;
create policy "Marketplace inquiry visibility" on public.inquiries for select using (
  buyer_id = auth.uid() or
  (status = 'active' and visibility = 'market' and archived_at is null) or
  exists (select 1 from public.inquiry_invitations inv where inv.inquiry_id = inquiries.id and inv.manufacturer_id = auth.uid()) or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
);

do $$ begin
  create policy "Buyers delete own inquiries"
  on public.inquiries for delete
  using (buyer_id = auth.uid());
exception when duplicate_object then null;
end $$;

drop policy if exists "Manufacturers create bids" on public.bids;
create policy "Eligible manufacturers create bids" on public.bids for insert with check (
  manufacturer_id = auth.uid() and
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'manufacturer') and
  exists (
    select 1 from public.inquiries i where i.id = inquiry_id and i.status = 'active' and (
      i.visibility = 'market' or exists (
        select 1 from public.inquiry_invitations inv where inv.inquiry_id = i.id and inv.manufacturer_id = auth.uid()
      )
    )
  )
);

do $$ begin
  create policy "Manufacturers revise own pending bids"
  on public.bids for update
  using (manufacturer_id = auth.uid() and status in ('pending', 'withdrawn'))
  with check (manufacturer_id = auth.uid() and status in ('pending', 'withdrawn'));
exception when duplicate_object then null;
end $$;

drop policy if exists "Buyers negotiate bids on own inquiries" on public.bids;

do $$ begin
  create policy "Admins moderate inquiries"
  on public.inquiries for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins read all bids"
  on public.bids for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins record audit actions"
  on public.admin_actions for insert with check (
    admin_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Order parties read disputes"
  on public.disputes for select using (
    exists (select 1 from public.orders o where o.id = disputes.order_id and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid()))
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Order parties file disputes"
  on public.disputes for insert with check (
    filed_by = auth.uid() and exists (select 1 from public.orders o where o.id = disputes.order_id and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid()))
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins manage disputes"
  on public.disputes for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins manage manufacturer profiles"
  on public.manufacturer_profiles for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins update platform profiles"
  on public.profiles for update using (
    public.is_platform_admin()
  ) with check (
    public.is_platform_admin()
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins update dispute orders"
  on public.orders for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins add dispute system messages"
  on public.messages for insert with check (
    sender_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "RFQ buyers manage inquiry products"
  on public.order_products for all using (
    exists (select 1 from public.inquiries i where i.id = order_products.inquiry_id and i.buyer_id = auth.uid())
  ) with check (
    exists (select 1 from public.inquiries i where i.id = order_products.inquiry_id and i.buyer_id = auth.uid())
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Eligible manufacturers view inquiry products"
  on public.order_products for select using (
    exists (
      select 1 from public.inquiries i where i.id = order_products.inquiry_id and i.status = 'active' and (
        i.visibility = 'market' or
        exists (select 1 from public.inquiry_invitations inv where inv.inquiry_id = i.id and inv.manufacturer_id = auth.uid())
      )
    )
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "RFQ buyers manage inquiry techpacks"
  on public.techpack_pages for all using (
    exists (
      select 1 from public.order_products op join public.inquiries i on i.id = op.inquiry_id
      where op.id = techpack_pages.order_product_id and i.buyer_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.order_products op join public.inquiries i on i.id = op.inquiry_id
      where op.id = techpack_pages.order_product_id and i.buyer_id = auth.uid()
    )
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Eligible manufacturers view inquiry techpacks"
  on public.techpack_pages for select using (
    exists (
      select 1 from public.order_products op join public.inquiries i on i.id = op.inquiry_id
      where op.id = techpack_pages.order_product_id and i.status = 'active' and (
        i.visibility = 'market' or
        exists (select 1 from public.inquiry_invitations inv where inv.inquiry_id = i.id and inv.manufacturer_id = auth.uid())
      )
    )
  );
exception when duplicate_object then null;
end $$;

create or replace function public.notify_marketplace_user(
  target_user_id uuid,
  target_inquiry_id uuid,
  event_type text,
  event_title text,
  event_body text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  notification_id uuid;
  allowed boolean;
begin
  select exists (
    select 1 from public.inquiries i
    where i.id = target_inquiry_id
      and (i.buyer_id = auth.uid() or exists (select 1 from public.bids b where b.inquiry_id = i.id and b.manufacturer_id = auth.uid()))
      and (i.buyer_id = target_user_id or exists (select 1 from public.bids b where b.inquiry_id = i.id and b.manufacturer_id = target_user_id))
  ) into allowed;
  if not allowed then raise exception 'Not a party to this RFQ'; end if;

  insert into public.notifications (user_id, actor_id, inquiry_id, type, title, body)
  values (target_user_id, auth.uid(), target_inquiry_id, event_type, event_title, event_body)
  returning id into notification_id;
  return notification_id;
end;
$$;

revoke all on function public.notify_marketplace_user(uuid, uuid, text, text, text) from public;
grant execute on function public.notify_marketplace_user(uuid, uuid, text, text, text) to authenticated;

create or replace function public.update_marketplace_bid_decision(
  target_bid_id uuid,
  bid_action text,
  target_shortlisted boolean default null,
  offered_unit_price numeric default null,
  offered_tat_days integer default null,
  offer_message text default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_bid public.bids%rowtype;
  selected_inquiry public.inquiries%rowtype;
  notification_title text;
  notification_body text;
begin
  select * into selected_bid from public.bids where id = target_bid_id for update;
  if selected_bid.id is null then raise exception 'Bid not found'; end if;
  select * into selected_inquiry from public.inquiries where id = selected_bid.inquiry_id;
  if selected_inquiry.buyer_id <> auth.uid() then raise exception 'Only the RFQ owner can manage this bid'; end if;
  if selected_bid.status <> 'pending' then raise exception 'Only pending bids can be changed'; end if;

  if bid_action = 'shortlist' then
    update public.bids set shortlisted = coalesce(target_shortlisted, not selected_bid.shortlisted), updated_at = now() where id = target_bid_id;
    notification_title := case when coalesce(target_shortlisted, not selected_bid.shortlisted) then 'Your bid was shortlisted' else 'Your bid left the shortlist' end;
    notification_body := 'The buyer updated their bid shortlist.';
  elsif bid_action = 'reject' then
    update public.bids set status = 'rejected', shortlisted = false, updated_at = now() where id = target_bid_id;
    notification_title := 'Your bid was not selected';
    notification_body := 'The buyer selected another direction.';
  elsif bid_action = 'counter' then
    if offered_unit_price is null or offered_unit_price <= 0 or offered_tat_days is null or offered_tat_days <= 0 then
      raise exception 'Counter price and turnaround must be positive';
    end if;
    update public.bids set counter_unit_price = offered_unit_price, counter_tat_days = offered_tat_days,
      counter_message = coalesce(offer_message, ''), shortlisted = true, updated_at = now()
    where id = target_bid_id;
    notification_title := 'Buyer sent a counter offer';
    notification_body := format('$%s per unit with %s day turnaround. %s', offered_unit_price, offered_tat_days, coalesce(offer_message, ''));
  else
    raise exception 'Unsupported bid action';
  end if;

  insert into public.notifications (user_id, actor_id, inquiry_id, type, title, body)
  values (selected_bid.manufacturer_id, auth.uid(), selected_bid.inquiry_id, 'bid_' || bid_action, notification_title, notification_body);
  return true;
end;
$$;

revoke all on function public.update_marketplace_bid_decision(uuid, text, boolean, numeric, integer, text) from public;
grant execute on function public.update_marketplace_bid_decision(uuid, text, boolean, numeric, integer, text) to authenticated;

create or replace function public.accept_marketplace_bid(target_bid_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_bid public.bids%rowtype;
  selected_inquiry public.inquiries%rowtype;
  created_order_id uuid;
  accepted_total numeric;
  accepted_tat integer;
begin
  select * into selected_bid from public.bids where id = target_bid_id for update;
  if selected_bid.id is null then raise exception 'Bid not found'; end if;

  select * into selected_inquiry from public.inquiries where id = selected_bid.inquiry_id for update;
  if selected_inquiry.buyer_id <> auth.uid() then raise exception 'Only the RFQ owner can accept a bid'; end if;
  if selected_inquiry.status <> 'active' then raise exception 'RFQ is no longer active'; end if;
  if selected_bid.status <> 'pending' then raise exception 'Bid is no longer pending'; end if;

  update public.bids set status = 'accepted', updated_at = now() where id = selected_bid.id;
  update public.bids set status = 'rejected', updated_at = now() where inquiry_id = selected_bid.inquiry_id and id <> selected_bid.id and status = 'pending';
  update public.inquiries set status = 'accepted', updated_at = now() where id = selected_inquiry.id;

  select coalesce(sum(
    op.quantity * coalesce(
      (select (line->>'unit_price')::numeric from jsonb_array_elements(coalesce(selected_bid.product_prices, '[]'::jsonb)) line where line->>'order_product_id' = op.id::text limit 1),
      selected_bid.unit_price
    )
  ), selected_bid.unit_price * coalesce(selected_inquiry.quantity, 0))
  into accepted_total
  from public.order_products op where op.inquiry_id = selected_inquiry.id;

  select greatest(selected_bid.tat_days, coalesce(max((line->>'tat_days')::integer), 0))
  into accepted_tat
  from jsonb_array_elements(coalesce(selected_bid.product_prices, '[]'::jsonb)) line;

  insert into public.orders (
    inquiry_id, bid_id, buyer_id, manufacturer_id, agreed_price, currency, tat_days,
    status, escrow_status, order_type, visibility, split_bidding, title,
    total_quantity, order_total
  ) values (
    selected_inquiry.id, selected_bid.id, selected_inquiry.buyer_id, selected_bid.manufacturer_id,
    accepted_total, selected_bid.currency, accepted_tat,
    'confirmed', 'pending', coalesce(selected_inquiry.order_type, 'sourcing'),
    case when selected_inquiry.visibility = 'private' then 'private' else 'exchange' end,
    coalesce(selected_inquiry.split_bidding, false), selected_inquiry.title,
    coalesce(selected_inquiry.quantity, 0), accepted_total
  ) returning id into created_order_id;

  update public.order_products op set
    order_id = created_order_id,
    bid_unit_price = coalesce(
      (select (line->>'unit_price')::numeric from jsonb_array_elements(coalesce(selected_bid.product_prices, '[]'::jsonb)) line where line->>'order_product_id' = op.id::text limit 1),
      selected_bid.unit_price
    )
  where inquiry_id = selected_inquiry.id;

  insert into public.notifications (user_id, actor_id, order_id, inquiry_id, type, title, body)
  values
    (selected_bid.manufacturer_id, auth.uid(), created_order_id, selected_inquiry.id, 'bid_accepted', 'Your bid was accepted', selected_inquiry.title),
    (selected_inquiry.buyer_id, selected_bid.manufacturer_id, created_order_id, selected_inquiry.id, 'order_created', 'Order created from accepted bid', selected_inquiry.title);

  insert into public.admin_actions (admin_id, action_type, target_type, target_id, notes)
  select auth.uid(), 'bid_accepted', 'order', created_order_id, 'Order created through marketplace acceptance'
  where exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin');

  return created_order_id;
end;
$$;

revoke all on function public.accept_marketplace_bid(uuid) from public;
grant execute on function public.accept_marketplace_bid(uuid) to authenticated;

-- Enable Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- 1. Users & Profiles
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  user_type     text check (user_type in ('buyer', 'manufacturer', 'admin')) not null,
  country       text,
  is_premium    boolean default false,
  whop_member_id text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table public.manufacturer_profiles (
  id                uuid primary key references public.profiles(id) on delete cascade,
  company_name      text not null,
  industry_ids      text[],
  country           text,
  city              text,
  established_year  integer,
  min_order_qty     integer,
  capabilities      text[],
  certifications    text[],
  portfolio_urls    text[],
  verified          boolean default false,
  verified_at       timestamptz,
  bio               text,
  website           text,
  bid_count_this_month integer default 0,
  bid_quota_resets_at  timestamptz
);

create table public.buyer_profiles (
  id            uuid primary key references public.profiles(id) on delete cascade,
  company_name  text,
  use_case      text check (use_case in ('brand', 'team', 'entrepreneur', 'other'))
);

create table public.manufacturer_payout_methods (
  id              uuid primary key default uuid_generate_v4(),
  manufacturer_id uuid references public.profiles(id) on delete cascade,
  method_type     text check (method_type in ('bank_swift', 'bank_local', 'usdc_solana', 'payoneer', 'wise')),
  is_default      boolean default false,
  account_details jsonb,
  verified        boolean default false,
  created_at      timestamptz default now()
);

-- 2. Industries
create table public.industries (
  id                 uuid primary key default uuid_generate_v4(),
  slug               text unique not null,
  name               text not null,
  description        text,
  icon               text,
  manufacturer_count integer default 0,
  is_active          boolean default true,
  created_at         timestamptz default now()
);

insert into public.industries (slug, name, description, icon) values
  ('sportswear',   'Sportswear',     'Jerseys, kits, gloves, balls, bags',      'shirt'),
  ('apparel',      'Apparel',        'Fashion, workwear, uniforms',              'layers'),
  ('leather-goods','Leather Goods',  'Bags, wallets, belts, footwear',           'briefcase'),
  ('electronics',  'Electronics',    'PCBs, enclosures, wearables',             'cpu'),
  ('packaging',    'Packaging',      'Boxes, labels, poly bags, cartons',       'package'),
  ('furniture',    'Furniture',      'Wooden, metal, upholstered',              'armchair');

-- 3. Inquiries
create type inquiry_status as enum (
  'draft', 'active', 'under_review', 'accepted',
  'in_production', 'completed', 'cancelled', 'expired'
);

create table public.inquiries (
  id                   uuid primary key default uuid_generate_v4(),
  inquiry_number       text unique not null,
  buyer_id             uuid references public.profiles(id) on delete cascade,
  industry_id          uuid references public.industries(id),
  title                text not null,
  description          text,
  product_category     text,
  quantity             integer,
  unit                 text default 'pieces',
  target_price         numeric,
  max_price            numeric,
  currency             text default 'USD',
  tat_days             integer,
  destination          text,
  sample_required      boolean default false,
  sample_tat_days      integer,
  techpack_urls        text[],
  reference_image_urls text[],
  special_notes        text,
  incoterms            text,
  status               inquiry_status default 'active',
  bid_count            integer default 0,
  expires_at           timestamptz,
  canvas_locked        boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create index on public.inquiries (industry_id, status);
create index on public.inquiries using gin (title gin_trgm_ops);

-- 4. Bids
create type bid_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

create table public.bids (
  id                  uuid primary key default uuid_generate_v4(),
  inquiry_id          uuid references public.inquiries(id) on delete cascade,
  manufacturer_id     uuid references public.profiles(id) on delete cascade,
  unit_price          numeric not null,
  currency            text default 'USD',
  tat_days            integer,
  sample_available    boolean default false,
  sample_tat_days     integer,
  message             text,
  portfolio_samples   text[],
  status              bid_status default 'pending',
  created_at          timestamptz default now(),
  unique (inquiry_id, manufacturer_id)
);

create index on public.bids (inquiry_id);
create index on public.bids (manufacturer_id);

-- 5. Orders & Milestones
create type order_status as enum (
  'confirmed', 'sampling', 'in_production', 'quality_check',
  'shipped', 'delivered', 'completed', 'disputed'
);

create type escrow_status as enum (
  'pending', 'funded', 'milestone_1_released',
  'milestone_2_released', 'completed', 'refunded'
);

create table public.orders (
  id                uuid primary key default uuid_generate_v4(),
  order_number      text unique not null,
  inquiry_id        uuid references public.inquiries(id),
  bid_id            uuid references public.bids(id),
  buyer_id          uuid references public.profiles(id),
  manufacturer_id   uuid references public.profiles(id),
  agreed_price      numeric,
  currency          text default 'USD',
  tat_days          integer,
  status            order_status default 'confirmed',
  escrow_status     escrow_status default 'pending',
  tracking_number   text,
  carrier           text,
  whop_escrow_id    text,
  remarks           text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create table public.order_milestones (
  id               uuid primary key default uuid_generate_v4(),
  order_id         uuid references public.orders(id) on delete cascade,
  milestone_number integer,
  title            text,
  description      text,
  percentage       integer,
  amount           numeric,
  status           text default 'pending',
  proof_urls       text[],
  due_date         date,
  completed_at     timestamptz,
  created_at       timestamptz default now()
);

-- 6. Disputes
create table public.disputes (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references public.orders(id),
  filed_by        uuid references public.profiles(id),
  reason          text check (reason in ('quality_issue', 'non_delivery', 'wrong_specs', 'payment_issue', 'other')),
  description     text,
  evidence_urls   text[],
  status          text default 'open' check (status in ('open', 'under_review', 'resolved_buyer', 'resolved_manufacturer', 'closed')),
  admin_notes     text,
  resolved_by     uuid references public.profiles(id),
  resolved_at     timestamptz,
  created_at      timestamptz default now()
);

-- 7. Messaging
create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references public.orders(id) on delete cascade,
  sender_id       uuid references public.profiles(id),
  content         text,
  attachment_urls text[],
  created_at      timestamptz default now()
);

create index on public.messages (order_id, created_at);

-- 8. Studio Projects
create table public.studio_projects (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid references public.profiles(id) on delete cascade,
  title        text not null,
  canvas_state jsonb,
  thumbnail_url text,
  prompt       text,
  template_type text,
  is_public    boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index on public.studio_projects (owner_id);

-- 9. Techpacks
create table public.techpacks (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid references public.orders(id),
  inquiry_id   uuid references public.inquiries(id),
  owner_id     uuid references public.profiles(id),
  title        text,
  file_url     text,
  canvas_data  jsonb,
  version      integer default 1,
  created_at   timestamptz default now()
);

-- 10. Logs
create table public.logs (
  id         uuid primary key default uuid_generate_v4(),
  timestamp  timestamptz default now(),
  category   text,
  message    text,
  user_id    uuid references public.profiles(id)
);

create index on public.logs (timestamp desc);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.inquiries enable row level security;
alter table public.bids enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.studio_projects enable row level security;

create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Active inquiries are public" on public.inquiries for select using (status = 'active' or buyer_id = auth.uid());
create policy "Buyers create own inquiries" on public.inquiries for insert with check (buyer_id = auth.uid());
create policy "Buyers update own inquiries" on public.inquiries for update using (buyer_id = auth.uid());

create policy "Manufacturers see own bids" on public.bids for select using (manufacturer_id = auth.uid());
create policy "Buyers see bids on their inquiries" on public.bids for select using (
  exists (select 1 from public.inquiries where id = bids.inquiry_id and buyer_id = auth.uid())
);
create policy "Manufacturers create bids" on public.bids for insert with check (manufacturer_id = auth.uid());

create policy "Order parties see their orders" on public.orders for select using (buyer_id = auth.uid() or manufacturer_id = auth.uid());

create policy "Order parties see messages" on public.messages for select using (
  exists (select 1 from public.orders where id = messages.order_id and (buyer_id = auth.uid() or manufacturer_id = auth.uid()))
);
create policy "Order parties send messages" on public.messages for insert with check (
  sender_id = auth.uid() and exists (select 1 from public.orders where id = messages.order_id and (buyer_id = auth.uid() or manufacturer_id = auth.uid()))
);

create policy "Owners see their projects" on public.studio_projects for select using (owner_id = auth.uid() or is_public = true);
create policy "Owners manage their projects" on public.studio_projects for all using (owner_id = auth.uid());

-- Triggers and Functions
create or replace function public.custom_access_token_hook(event jsonb) returns jsonb as $$
declare
  claims jsonb;
  user_type text;
begin
  select p.user_type into user_type from public.profiles p where p.id = (event->>'user_id')::uuid;
  claims := event->'claims';
  claims := jsonb_set(claims, '{user_type}', to_jsonb(user_type));
  return jsonb_set(event, '{claims}', claims);
end;
$$ language plpgsql security definer;

create or replace function generate_inquiry_number() returns trigger as $$
begin
  new.inquiry_number := 'PRV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('inquiry_number_seq')::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create sequence if not exists inquiry_number_seq start 1;
create trigger set_inquiry_number before insert on public.inquiries for each row execute function generate_inquiry_number();

create or replace function generate_order_number() returns trigger as $$
begin
  new.order_number := 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create sequence if not exists order_number_seq start 1;
create trigger set_order_number before insert on public.orders for each row execute function generate_order_number();

create or replace function update_inquiry_bid_count() returns trigger as $$
begin
  update public.inquiries set bid_count = bid_count + 1 where id = new.inquiry_id;
  return new;
end;
$$ language plpgsql;

create trigger on_bid_insert after insert on public.bids for each row execute function update_inquiry_bid_count();

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_inquiries before update on public.inquiries for each row execute function set_updated_at();
create trigger set_updated_at_orders before update on public.orders for each row execute function set_updated_at();

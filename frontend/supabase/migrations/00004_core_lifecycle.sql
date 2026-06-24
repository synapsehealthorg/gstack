-- ============================================================
-- 00004_core_lifecycle.sql
-- Canonical proov lifecycle: Studio snapshot -> RFQ/order canvas
-- -> bids -> techpack revisions -> manual escrow -> production audit.
-- ============================================================

-- Product snapshots are the handoff contract between Studio and commerce.
create table if not exists public.product_snapshots (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade,
  studio_project_id uuid references public.studio_projects(id) on delete set null,
  name text not null,
  category text default 'sportswear',
  thumbnail_url text,
  mockup_urls text[] default '{}',
  layers jsonb default '[]',
  specs jsonb default '{}',
  colorways jsonb default '[]',
  branding_profile jsonb default '{}',
  source text default 'studio' check (source in ('studio', 'import', 'template', 'manual')),
  is_blank_template boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.product_snapshots enable row level security;

do $$ begin
  create policy "Users manage own product snapshots"
  on public.product_snapshots for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
exception when duplicate_object then null;
end $$;

-- RFQ/order-canvas fields live on inquiries until a bid is accepted.
alter table public.inquiries
  add column if not exists order_type text check (order_type in ('sourcing', 'selling')) default 'sourcing',
  add column if not exists visibility text check (visibility in ('market', 'private')) default 'market',
  add column if not exists split_bidding boolean default false,
  add column if not exists logistics jsonb default '{}',
  add column if not exists order_total numeric default 0,
  add column if not exists product_count integer default 0,
  add column if not exists quality_coverage_flags jsonb default '{}',
  add column if not exists private_share_token text,
  add column if not exists published_at timestamptz;

-- Extra structured product details needed by the Order Canvas.
alter table public.order_products
  add column if not exists product_snapshot_id uuid references public.product_snapshots(id) on delete set null,
  add column if not exists thumbnail_url text,
  add column if not exists is_blank_template boolean default false,
  add column if not exists size_grid jsonb default '{}',
  add column if not exists roster_enabled boolean default false,
  add column if not exists roster_rows jsonb default '[]',
  add column if not exists specs_snapshot jsonb default '{}',
  add column if not exists quality_coverage text default 'full' check (quality_coverage in ('full', 'partial'));

-- Compatibility fields for older UI reads while the app is migrated.
alter table public.orders
  add column if not exists title text,
  add column if not exists total_quantity integer default 0,
  add column if not exists order_total numeric default 0;

-- Versioned, reasoned manufacturer edits to locked techpacks.
create table if not exists public.techpack_revisions (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  order_product_id uuid references public.order_products(id) on delete cascade,
  proposed_by uuid references public.profiles(id),
  base_version integer default 1,
  proposed_version integer default 2,
  status text default 'proposed' check (status in ('proposed', 'accepted', 'rejected', 'reverted', 'cancelled')),
  field_diffs jsonb default '[]',
  reasoning text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table public.techpack_revisions enable row level security;

do $$ begin
  create policy "Order parties see techpack revisions"
  on public.techpack_revisions for select using (
    exists (
      select 1 from public.orders o
      where o.id = techpack_revisions.order_id
      and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid())
    )
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Order parties create techpack revisions"
  on public.techpack_revisions for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = techpack_revisions.order_id
      and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid())
    )
  );
exception when duplicate_object then null;
end $$;

-- Manual escrow ledger for the first 10-20 real orders.
create table if not exists public.escrow_ledger_entries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  milestone_id uuid references public.order_milestones(id) on delete set null,
  actor_id uuid references public.profiles(id),
  entry_type text not null check (entry_type in ('manual_funding', 'milestone_release', 'refund', 'adjustment', 'subscription')),
  amount numeric not null default 0,
  currency text default 'USD',
  status text default 'pending' check (status in ('pending', 'recorded', 'released', 'failed', 'cancelled')),
  payment_rail text default 'manual' check (payment_rail in ('manual', 'whop', 'stripe', 'coinbase', 'bank_transfer', 'usdc')),
  reference text,
  notes text,
  created_at timestamptz default now()
);

alter table public.escrow_ledger_entries enable row level security;

do $$ begin
  create policy "Order parties see escrow ledger"
  on public.escrow_ledger_entries for select using (
    exists (
      select 1 from public.orders o
      where o.id = escrow_ledger_entries.order_id
      and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid())
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins manage escrow ledger"
  on public.escrow_ledger_entries for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'admin')
  );
exception when duplicate_object then null;
end $$;

-- Notifications and system chat audit events.
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete cascade,
  inquiry_id uuid references public.inquiries(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

do $$ begin
  create policy "Users manage own notifications"
  on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
exception when duplicate_object then null;
end $$;

alter table public.messages
  add column if not exists message_type text default 'human' check (message_type in ('human', 'system')),
  add column if not exists event_type text,
  add column if not exists metadata jsonb default '{}';

-- Milestone audit events make production tracking explainable.
create table if not exists public.milestone_events (
  id uuid primary key default uuid_generate_v4(),
  milestone_id uuid references public.order_milestones(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  proof_urls text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

alter table public.milestone_events enable row level security;

do $$ begin
  create policy "Order parties see milestone events"
  on public.milestone_events for select using (
    exists (
      select 1 from public.orders o
      where o.id = milestone_events.order_id
      and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid())
    )
  );
exception when duplicate_object then null;
end $$;

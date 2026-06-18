-- 00001_admin_tables.sql

-- Admin Actions Audit Log
create table public.admin_actions (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid references public.profiles(id),
  action_type text,
  target_type text,
  target_id   uuid,
  notes       text,
  metadata    jsonb,
  created_at  timestamptz default now()
);

alter table public.admin_actions enable row level security;
create policy "Admins read actions" on public.admin_actions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and user_type = 'admin')
);

-- Payouts
create table public.payouts (
  id                uuid primary key default uuid_generate_v4(),
  order_id          uuid references public.orders(id),
  manufacturer_id   uuid references public.profiles(id),
  milestone_number  integer,
  gross_amount      numeric,
  fee_amount        numeric,
  net_amount        numeric,
  payout_method_id  uuid references public.manufacturer_payout_methods(id),
  status            text default 'pending' check (
    status in ('pending','processing','completed','failed')
  ),
  admin_notes       text,
  processed_by      uuid references public.profiles(id),
  processed_at      timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz default now()
);

alter table public.payouts enable row level security;

-- Policies for Payouts
create policy "Admins can manage payouts" on public.payouts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and user_type = 'admin')
);

create policy "Manufacturers can view their own payouts" on public.payouts for select using (
  manufacturer_id = auth.uid()
);

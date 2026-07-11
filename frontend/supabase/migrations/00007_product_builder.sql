-- Product Builder persistence and library lifecycle.
alter table public.product_snapshots
  add column if not exists template_id text,
  add column if not exists builder_state jsonb default '{}',
  add column if not exists is_favorite boolean default false,
  add column if not exists archived_at timestamptz,
  add column if not exists status text default 'draft' check (status in ('draft', 'ready')),
  add column if not exists last_opened_at timestamptz;

create index if not exists product_snapshots_owner_updated_idx
  on public.product_snapshots (owner_id, updated_at desc);

create index if not exists product_snapshots_owner_favorite_idx
  on public.product_snapshots (owner_id, is_favorite)
  where archived_at is null;

create or replace function public.touch_product_snapshot_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists product_snapshot_updated_at on public.product_snapshots;
create trigger product_snapshot_updated_at
before update on public.product_snapshots
for each row execute function public.touch_product_snapshot_updated_at();

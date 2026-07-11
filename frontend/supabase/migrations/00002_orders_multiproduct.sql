-- ============================================================
-- 00001_orders_multiproduct.sql
-- Multi-product orders, per-product techpacks, split bidding
-- ============================================================

-- Extend orders table with order type and flow metadata
alter table public.orders
  add column if not exists order_type     text check (order_type in ('sourcing', 'selling')) default 'sourcing',
  add column if not exists visibility     text check (visibility in ('exchange', 'private'))  default 'exchange',
  add column if not exists split_bidding  boolean default false,
  add column if not exists techpack_locked boolean default false,
  add column if not exists shared_with    uuid[];  -- up to 5 invited manufacturer IDs

-- Order products — one row per product within an order
create table if not exists public.order_products (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references public.orders(id) on delete cascade,
  inquiry_id      uuid references public.inquiries(id),  -- nullable; set when sourcing path uses an inquiry
  studio_project_id uuid references public.studio_projects(id),
  name            text not null,
  style_code      text,
  category        text,
  primary_material text,
  quantity        integer not null default 1,
  unit            text default 'pieces',
  target_unit_price numeric,
  bid_unit_price  numeric,    -- manufacturer's accepted bid price for this product
  sort_order      integer default 0,
  created_at      timestamptz default now()
);

create index if not exists order_products_order_id_idx on public.order_products (order_id);
create index if not exists order_products_studio_project_id_idx on public.order_products (studio_project_id);

-- Techpack pages — one row per page per product
DO $$ BEGIN
    CREATE TYPE techpack_page_type AS ENUM (
        'cover', 'flats', 'bom', 'measurements', 'colorways', 'packaging'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists public.techpack_pages (
  id               uuid primary key default uuid_generate_v4(),
  order_product_id uuid references public.order_products(id) on delete cascade,
  page_type        techpack_page_type not null,
  content          jsonb default '{}',   -- structured field data per page type
  image_urls       text[] default '{}',  -- product hero + flatlay images
  is_complete      boolean default false,
  version          integer default 1,
  updated_at       timestamptz default now(),
  unique (order_product_id, page_type)
);

create index if not exists techpack_pages_order_product_id_idx on public.techpack_pages (order_product_id);

-- Inspiration files — uploaded by buyer to help manufacturer
create table if not exists public.order_inspirations (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid references public.orders(id) on delete cascade,
  uploader_id     uuid references public.profiles(id),
  file_url        text not null,
  file_type       text,  -- 'image', 'pdf', 'sketch'
  caption         text,
  created_at      timestamptz default now()
);

-- Extend bids for per-product pricing (split bidding)
alter table public.bids
  add column if not exists product_prices jsonb default '[]';
  -- jsonb array of { order_product_id: uuid, unit_price: numeric, tat_days: integer }

-- Addresses saved by users
create table if not exists public.saved_addresses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete cascade,
  label       text,          -- e.g. "Warehouse — London, UK"
  address     text,
  city        text,
  country     text,
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- Techpack lock event log
create table if not exists public.techpack_lock_events (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid references public.orders(id) on delete cascade,
  locked_by   uuid references public.profiles(id),
  locked_at   timestamptz default now(),
  version_snapshot jsonb  -- snapshot of all techpack_pages at lock time
);

-- RLS for new tables
alter table public.order_products     enable row level security;
alter table public.techpack_pages     enable row level security;
alter table public.order_inspirations enable row level security;
alter table public.saved_addresses    enable row level security;

DO $$ BEGIN
    create policy "Order parties see products"
    on public.order_products for select using (
        exists (select 1 from public.orders
                where id = order_products.order_id
                and (buyer_id = auth.uid() or manufacturer_id = auth.uid()))
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create policy "Buyers manage order products"
    on public.order_products for all using (
        exists (select 1 from public.orders
                where id = order_products.order_id and buyer_id = auth.uid())
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create policy "Order parties see techpack pages"
    on public.techpack_pages for select using (
        exists (
        select 1 from public.order_products op
        join public.orders o on o.id = op.order_id
        where op.id = techpack_pages.order_product_id
            and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid())
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create policy "Buyer and manufacturer can edit techpack (pre-lock)"
    on public.techpack_pages for update using (
        exists (
        select 1 from public.order_products op
        join public.orders o on o.id = op.order_id
        where op.id = techpack_pages.order_product_id
            and o.techpack_locked = false
            and (o.buyer_id = auth.uid() or o.manufacturer_id = auth.uid())
        )
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create policy "Users see own inspirations"
    on public.order_inspirations for select using (
        uploader_id = auth.uid() or
        exists (select 1 from public.orders
                where id = order_inspirations.order_id
                and (buyer_id = auth.uid() or manufacturer_id = auth.uid()))
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create policy "Users manage own addresses"
    on public.saved_addresses for all using (user_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sequence for techpack version numbers
create or replace function increment_techpack_version() returns trigger as $$
begin
  new.version = old.version + 1;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DO $$ BEGIN
    create trigger techpack_version_bump
    before update on public.techpack_pages
    for each row execute function increment_techpack_version();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

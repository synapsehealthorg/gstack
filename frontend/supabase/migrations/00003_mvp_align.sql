-- 00003_mvp_align.sql

-- 1. Manufacturer Profiles Alignment
-- Remove deprecated quota fields since bidding is free for verified users
ALTER TABLE public.manufacturer_profiles 
  DROP COLUMN IF EXISTS bid_count_this_month,
  DROP COLUMN IF EXISTS bid_quota_resets_at;

-- Add tier, plan type, and credits
ALTER TABLE public.manufacturer_profiles
  ADD COLUMN IF NOT EXISTS verification_tier integer default 0,
  ADD COLUMN IF NOT EXISTS plan_type text default 'free' check (plan_type in ('free', 'starter', 'studio')),
  ADD COLUMN IF NOT EXISTS ai_credits integer default 20;

-- 2. Verification Submissions
-- Holds documents (Tier 2/3) submitted for manual review by admins
CREATE TABLE IF NOT EXISTS public.verification_submissions (
  id uuid primary key default uuid_generate_v4(),
  manufacturer_id uuid references public.profiles(id) on delete cascade,
  tier_requested integer check (tier_requested in (1, 2, 3)),
  document_urls text[],
  notes text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- RLS for verification_submissions
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Manufacturers can view their own submissions"
      ON public.verification_submissions FOR SELECT
      USING (manufacturer_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Manufacturers can create submissions"
      ON public.verification_submissions FOR INSERT
      WITH CHECK (manufacturer_id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can view all submissions"
      ON public.verification_submissions FOR SELECT
      USING (
        exists (select 1 from public.profiles where id = auth.uid() and user_type = 'admin')
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can update submissions"
      ON public.verification_submissions FOR UPDATE
      USING (
        exists (select 1 from public.profiles where id = auth.uid() and user_type = 'admin')
      );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

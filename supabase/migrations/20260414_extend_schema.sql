-- TC5 Schema Extension
-- Run this in the Supabase SQL Editor

-- ============================================================================
-- 1. PROFILES: Add wedding data
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner_name_1 text,
  ADD COLUMN IF NOT EXISTS partner_name_2 text,
  ADD COLUMN IF NOT EXISTS wedding_date date,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at') THEN
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END;
$$;

-- ============================================================================
-- 2. CUSTOMIZATIONS: Add design state fields
-- ============================================================================

ALTER TABLE public.customizations
  DROP CONSTRAINT IF EXISTS customizations_status_check;
ALTER TABLE public.customizations
  ADD CONSTRAINT customizations_status_check
  CHECK (status IN ('draft', 'proof_generated', 'proof_approved', 'locked'));

ALTER TABLE public.customizations
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS name_layout text default 'single-line',
  ADD COLUMN IF NOT EXISTS accent_connector boolean default true,
  ADD COLUMN IF NOT EXISTS accent_single_line boolean default false,
  ADD COLUMN IF NOT EXISTS reverse_enabled boolean default false,
  ADD COLUMN IF NOT EXISTS reverse_blocks jsonb default '[]'::jsonb;

-- ============================================================================
-- 3. ORDERS: Align statuses with business workflow
-- ============================================================================

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending', 'printing', 'completed', 'cancelled',
    'payment_complete', 'in_production', 'shipped', 'delivered'
  ));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS include_reverse boolean default false,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger AS $$
DECLARE
  seq integer;
BEGIN
  SELECT count(*) + 1 INTO seq FROM public.orders;
  NEW.order_number := 'TC-' || lpad(seq::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'orders_generate_number') THEN
    CREATE TRIGGER orders_generate_number
      BEFORE INSERT ON public.orders
      FOR EACH ROW
      WHEN (NEW.order_number IS NULL)
      EXECUTE FUNCTION public.generate_order_number();
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ============================================================================
-- 4. SAVED DESIGNS: Customer save/resume
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_designs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  name text not null default 'My Design',
  sections_data jsonb not null default '{}'::jsonb,
  selected_palette text not null default '',
  selected_fonts text not null default '',
  accent_color text,
  name_layout text default 'single-line',
  accent_connector boolean default true,
  accent_single_line boolean default false,
  reverse_enabled boolean default false,
  reverse_blocks jsonb default '[]'::jsonb,
  proof_pdf_url text,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'locked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_saved_designs_customer ON public.saved_designs(customer_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_product ON public.saved_designs(product_id);

ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Customers can manage own saved designs'
  ) THEN
    CREATE POLICY "Customers can manage own saved designs"
      ON public.saved_designs FOR ALL
      USING (customer_id = auth.uid());
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all saved designs'
  ) THEN
    CREATE POLICY "Admins can view all saved designs"
      ON public.saved_designs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'saved_designs_updated_at') THEN
    CREATE TRIGGER saved_designs_updated_at
      BEFORE UPDATE ON public.saved_designs
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END;
$$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS saved_design_id uuid references public.saved_designs(id);

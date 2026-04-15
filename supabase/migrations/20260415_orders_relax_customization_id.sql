-- Relax customization_id to be nullable so new orders can reference
-- saved_design_id instead. Legacy orders still keep their customization_id.

ALTER TABLE public.orders
  ALTER COLUMN customization_id DROP NOT NULL;

-- Enforce that every order references either a customization OR a saved_design
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_has_design_source'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_has_design_source
      CHECK (customization_id IS NOT NULL OR saved_design_id IS NOT NULL);
  END IF;
END;
$$;

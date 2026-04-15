-- Fix infinite recursion in profiles RLS
-- The "Admins can view all profiles" policy was querying profiles inside its own
-- condition. Replace with a SECURITY DEFINER function that bypasses RLS cleanly.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Drop the recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage customizations" ON public.customizations;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage order events" ON public.order_events;
DROP POLICY IF EXISTS "Admins can view all saved designs" ON public.saved_designs;

-- Recreate using the function (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage templates"
  ON public.templates FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage customizations"
  ON public.customizations FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage order events"
  ON public.order_events FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can view all saved designs"
  ON public.saved_designs FOR SELECT
  USING (public.is_admin());

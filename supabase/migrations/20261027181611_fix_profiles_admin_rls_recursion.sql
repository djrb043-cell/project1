/*
# Fix GiroLoc profile authorization recursion

## Summary
Replaces self-referencing profile policies that caused login to fail with an explicit security-definer admin check.

## Modified objects
- `public.is_admin()`: new private authorization helper that checks the signed-in user's role without triggering profile policy recursion.
- `profiles` policies: admin access now uses `is_admin()`.
- `orders` admin policies: global admin access now uses `is_admin()`.

## Security changes
- The helper uses a fixed `search_path` and is executable only by authenticated users.
- Lojista accounts no longer receive general profile INSERT or UPDATE privileges, preventing client-side role changes.
- Admin profile updates are limited to the `active` column.

## Important notes
1. Existing profiles and orders are preserved.
2. The login flow can read the signed-in profile again.
3. Only the server-side account creation function creates new store profiles.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND active = true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (active) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_admin_select" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;

CREATE POLICY "orders_admin_select" ON public.orders FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "orders_admin_delete" ON public.orders FOR DELETE
TO authenticated
USING (public.is_admin());

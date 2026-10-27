/*
# Create set_user_password function

1. New Functions
- `public.set_user_password(target_user_id uuid, new_password text)`
  - SECURITY DEFINER function that updates a user's password directly in auth.users
  - Hashes the password using bcrypt (gen_salt('bf', 10)) compatible with GoTrue
  - Used by the update-user-password edge function to bypass Supabase's weak-password check
2. Security
- REVOKE EXECUTE from PUBLIC and anon to prevent unauthorized calls
- GRANT EXECUTE only to service_role (used by edge functions with the service role key)
- The edge function still verifies the caller is an admin before invoking this function
*/

CREATE OR REPLACE FUNCTION public.set_user_password(target_user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'auth', 'public'
AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf', 10)),
      updated_at = now()
  WHERE id = target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_user_password(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_password(uuid, text) TO service_role;

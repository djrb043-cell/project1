/*
# Fix set_user_password search_path to include extensions schema

gen_salt and crypt are in the "extensions" schema. The function's SET search_path
was only 'auth', 'public', so gen_salt couldn't be found. Add 'extensions'.
*/

DROP FUNCTION IF EXISTS public.set_user_password(uuid, text);

CREATE OR REPLACE FUNCTION public.set_user_password(target_user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'auth', 'public', 'extensions'
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

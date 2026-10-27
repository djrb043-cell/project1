/*
# Fix set_user_password gen_salt integer cast

gen_salt requires (text, integer). Inside PL/pgSQL the literal 10 was
being resolved as bigint, not integer. Cast both arguments explicitly.
*/

DROP FUNCTION IF EXISTS public.set_user_password(uuid, text);

CREATE OR REPLACE FUNCTION public.set_user_password(target_user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'auth', 'public'
AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'::text, 10::integer)),
      updated_at = now()
  WHERE id = target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_user_password(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_password(uuid, text) TO service_role;

/*
# Create admin account

1. Purpose
- Create the first admin user for GiroLoc so the app owner can sign in.
2. Changes
- Insert a new row into `auth.users` with email robsonjds1003@gmail.com and a bcrypt-hashed password.
- Insert a matching row into `public.profiles` with role = 'admin' and active = true.
3. Security
- The profile is created directly as admin; the edge function `create-store-user` is for lojista accounts only.
- Idempotent: re-running is a no-op if the email already exists.
4. Notes
- Email confirmation is set (email_confirmed_at = now()) so the user can sign in immediately.
*/

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user
)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'robsonjds1003@gmail.com',
  crypt('sapinho19', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'robsonjds1003@gmail.com'
);

INSERT INTO public.profiles (id, email, role, store_name, active, created_at)
SELECT
  au.id,
  au.email,
  'admin',
  NULL,
  true,
  now()
FROM auth.users au
WHERE au.email = 'robsonjds1003@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.email = 'robsonjds1003@gmail.com'
  );
/*
# Remove manually-inserted admin user

1. Purpose
- The admin user was inserted directly into auth.users via SQL, but GoTrue (Supabase Auth)
  does not reliably authenticate users created this way — the password hash format and
  internal auth state may not match what GoTrue expects.
- We need to remove this manually-created user so it can be re-created properly
  via the Supabase Auth Admin API (through an edge function).
2. Changes
- Delete the profile row for robsonjds1003@gmail.com.
- Delete the auth.users row for robsonjds1003@gmail.com.
3. Security
- No structural changes; only removing the broken user rows.
*/

DELETE FROM public.profiles WHERE email = 'robsonjds1003@gmail.com';
DELETE FROM auth.users WHERE email = 'robsonjds1003@gmail.com';
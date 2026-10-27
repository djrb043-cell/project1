/*
# Fix admin password bcrypt cost

1. Purpose
- The admin account was created with a bcrypt hash at cost 6, but Supabase Auth expects cost 10.
- This caused "senha incorreta" even though the password itself was correct.
2. Changes
- Update the encrypted_password for robsonjds1003@gmail.com using crypt() with gen_salt('bf', 10) to match Supabase Auth's expected bcrypt cost.
3. Security
- No structural changes; only the password hash is replaced.
*/

UPDATE auth.users
SET encrypted_password = crypt('sapinho19', gen_salt('bf', 10)),
    updated_at = now()
WHERE email = 'robsonjds1003@gmail.com';
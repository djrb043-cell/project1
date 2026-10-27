/*
# GiroLoc MVP Schema

## Summary
Creates the full database schema for GiroLoc, a local delivery startup platform.

## New Tables

### profiles
Stores user profiles with RBAC roles.
- id: uuid, primary key, references auth.users
- email: text, user email
- role: text, either 'admin' or 'lojista'
- store_name: text, display name for lojista accounts
- active: boolean, whether the account is active
- created_at: timestamp

### orders
Stores delivery orders created by lojistas.
- id: uuid, primary key
- store_id: uuid, references profiles(id) — the lojista who created it
- store_name: text, denormalized store name for admin views
- client_name: text, recipient name
- client_whatsapp: text, recipient WhatsApp number
- address: text, full delivery address
- neighborhood: text, selected neighborhood
- city: text, city of delivery
- fee: numeric, calculated delivery fee
- payment_method: text, one of 'pix_coleta', 'pix_entrega', 'frete_pago'
- status: text, one of 'pendente', 'em_rota', 'entregue', 'nao_entregue'
- received_by: text, who received the package (filled on delivery check)
- floripa_distance_km: numeric, km for Florianópolis orders
- notes: text, optional notes
- created_at: timestamp

## Security
- RLS enabled on both tables
- Admins have full read/write access globally
- Lojistas can only read/write their own store's orders
- Profiles readable by the owner; admin can read all
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'lojista')) DEFAULT 'lojista',
  store_name text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO service_role;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admin can read all profiles
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() AND p2.role = 'admin'
  )
);

-- Admin can update all profiles (e.g. deactivate)
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid() AND p2.role = 'admin'
  )
);

-- Service role inserts (for edge function user creation)
DROP POLICY IF EXISTS "profiles_service_insert" ON profiles;
CREATE POLICY "profiles_service_insert" ON profiles FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_service_update" ON profiles;
CREATE POLICY "profiles_service_update" ON profiles FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_service_select" ON profiles;
CREATE POLICY "profiles_service_select" ON profiles FOR SELECT
TO service_role
USING (true);


CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  client_name text NOT NULL,
  client_whatsapp text NOT NULL,
  address text NOT NULL,
  neighborhood text NOT NULL,
  city text NOT NULL DEFAULT 'Palhoça',
  fee numeric(10,2),
  payment_method text NOT NULL CHECK (payment_method IN ('pix_coleta', 'pix_entrega', 'frete_pago')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_rota', 'entregue', 'nao_entregue')),
  received_by text,
  floripa_distance_km numeric(10,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO service_role;

-- Lojista: select own store orders
DROP POLICY IF EXISTS "orders_lojista_select" ON orders;
CREATE POLICY "orders_lojista_select" ON orders FOR SELECT
TO authenticated
USING (store_id = auth.uid());

-- Lojista: insert own store orders
DROP POLICY IF EXISTS "orders_lojista_insert" ON orders;
CREATE POLICY "orders_lojista_insert" ON orders FOR INSERT
TO authenticated
WITH CHECK (store_id = auth.uid());

-- Lojista: update own store orders (e.g. cancel)
DROP POLICY IF EXISTS "orders_lojista_update" ON orders;
CREATE POLICY "orders_lojista_update" ON orders FOR UPDATE
TO authenticated
USING (store_id = auth.uid())
WITH CHECK (store_id = auth.uid());

-- Lojista: delete own store orders
DROP POLICY IF EXISTS "orders_lojista_delete" ON orders;
CREATE POLICY "orders_lojista_delete" ON orders FOR DELETE
TO authenticated
USING (store_id = auth.uid());

-- Admin: select all orders
DROP POLICY IF EXISTS "orders_admin_select" ON orders;
CREATE POLICY "orders_admin_select" ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Admin: update all orders (delivery check, status changes)
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Admin: delete any order
DROP POLICY IF EXISTS "orders_admin_delete" ON orders;
CREATE POLICY "orders_admin_delete" ON orders FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

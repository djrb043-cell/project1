/*
# Restrict GiroLoc data to signed-in users

## Summary
Removes public anonymous access from GiroLoc profiles and orders.

## Modified tables
- `profiles`: anonymous users no longer have table privileges.
- `orders`: anonymous users no longer have table privileges.

## Security changes
- Only authenticated users can reach application data through the Data API.
- Existing row-level policies continue to separate admins from lojistas and stores from other stores.

## Important notes
1. Existing rows are preserved.
2. The login screen remains public, but all data requests require a valid signed-in session.
*/

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.orders FROM anon;
REVOKE DELETE ON public.profiles FROM authenticated;

/*
# Track delivery completion time

## Summary
Adds the timestamp needed to move delivered orders out of the store's closed-today list and into a date-filterable history.

## Modified table
- `public.orders`
- `delivered_at`: timestamp set when an administrator confirms delivery and cleared when delivery is undone.

## Security changes
- Existing authenticated grants and row-level policies remain in place.
- Only the existing administrator delivery flow writes this field in the interface.

## Important notes
1. Existing orders remain unchanged and have no delivery timestamp until a delivery is confirmed.
2. No rows or columns are deleted.
3. The timestamp stores the actual confirmation time for date and time filtering.
*/

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

CREATE INDEX IF NOT EXISTS orders_delivered_at_idx
  ON public.orders (delivered_at);

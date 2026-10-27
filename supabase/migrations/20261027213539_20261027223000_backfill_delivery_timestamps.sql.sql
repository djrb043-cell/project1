/*
# Backfill delivery timestamps

## Summary
Makes existing delivered orders visible in the new delivery history without changing their customer or delivery information.

## Modified table
- `public.orders`
- `delivered_at` is filled from `created_at` only for older rows already marked `entregue` and still missing a delivery timestamp.

## Security changes
- No permissions or row-level security policies are changed.

## Important notes
1. Only existing delivered orders are updated.
2. New delivery confirmations continue to use the actual confirmation time.
3. No order is deleted or otherwise rewritten.
*/

UPDATE public.orders
SET delivered_at = created_at
WHERE status = 'entregue'
  AND delivered_at IS NULL;

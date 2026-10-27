/*
# Add order list workflow tracking

## Summary
Adds durable markers so GiroLoc can distinguish a store's open order list from orders already collected by the delivery team.

## Modified table
- `public.orders`
- `sent_to_giroloc`: records that the store sent its current list to GiroLoc.
- `collected_at`: records when the delivery team collected the order.
- `collected_by`: records who confirmed the collection.

## Security changes
- Existing authenticated grants and row-level security policies remain in place.
- Store users can update their own orders through the existing store policy.
- Admin users can update all orders through the existing admin policy.

## Important notes
1. Existing orders remain available and are treated as open until the store sends them.
2. No existing order data is deleted or changed.
3. Collection details are optional until the delivery team confirms collection.
*/

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS sent_to_giroloc boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS collected_at timestamptz,
  ADD COLUMN IF NOT EXISTS collected_by text;

CREATE INDEX IF NOT EXISTS orders_sent_to_giroloc_idx
  ON public.orders (sent_to_giroloc, collected_at);

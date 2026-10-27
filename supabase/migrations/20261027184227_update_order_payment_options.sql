/*
# Update GiroLoc payment options

## Summary
Replaces delivery-stage PIX options with internal store control options.

## Modified table
- `orders.payment_method`: existing PIX values are mapped to the new internal values, then validation accepts only `pago_loja` and `receber_loja`.

## Security
The existing authenticated row-level access policies remain unchanged.

## Important notes
1. Existing order records are preserved and their payment labels are mapped safely.
2. The new values describe whether the store has already received payment or still needs to receive it.
*/

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

UPDATE public.orders
SET payment_method = CASE
  WHEN payment_method IN ('pix_coleta', 'frete_pago') THEN 'pago_loja'
  WHEN payment_method = 'pix_entrega' THEN 'receber_loja'
  ELSE payment_method
END;

ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('pago_loja', 'receber_loja'));

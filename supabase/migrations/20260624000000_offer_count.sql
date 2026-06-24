-- Add offer_count: the number of independent price offers backing an estimate.
-- An aggregator that lists many merchant offers is real market evidence, so the
-- app scores confidence on offer_count, not just distinct merchant domains.
--
-- Additive and backward-compatible: existing rows read NULL and the app falls
-- back to distinct-source/domain counts. Safe to apply before or after the
-- backend deploy (current prod code simply ignores the new column).

alter table if exists public.wine_prices
  add column if not exists offer_count integer;

alter table if exists public.price_history
  add column if not exists offer_count integer;

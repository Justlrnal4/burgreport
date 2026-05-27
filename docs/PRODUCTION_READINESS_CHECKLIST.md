# BurgReport Production Readiness Checklist

## Current Blockers

- Configure the Railway backend with a working pricing provider key. The live `/api/search` path currently falls back to unavailable pricing when `OPENAI_API_KEY` is missing.
- Decide whether OpenAI web search remains only a fallback, or replace the primary price path with a licensed market data provider.
- Cut DNS only after `burgreport.com`, `www.burgreport.com`, and the Lovable production deployment serve the same app.

## Supabase Security

The Supabase project has public tables with RLS disabled. Do not enable RLS blindly in production; create policies first so the backend keeps working.

Recommended model:

- Public read, backend-only write: `grand_crus`, `vintage_ratings`, `climats`, `climat_aliases`, `vintages`, `merchants`, `price_snapshots`
- Backend-only read/write: `wine_prices`, `search_log`, `raw_price_observations`, `normalized_price_observations`
- User-owned rows: `user_profiles`, `watchlist`, `cellar_entries`

Before applying RLS:

1. Confirm whether the backend uses a service-role JWT or anon key.
2. Add explicit read policies for public reference tables.
3. Keep ingestion/cache/log tables private to service-role access.
4. Re-run Supabase security and performance advisors.

## Pricing Provider Priority

Best fit for product pricing:

1. Wine-Searcher API for retail average/min/max and merchant availability.
2. Liv-ex for professional fine-wine market data, benchmarks, historical time series, and LWIN identifiers.
3. Wine Owners or WineStreet for LWIN normalization, market history, and scores if Liv-ex access is not practical.
4. OpenAI web search as an enrichment/fallback layer, not the primary source of price truth.

## Backend Data Model

The live backend still reads `grand_crus`, `wine_prices`, `vintage_ratings`, and `search_log`. The newer truth-model tables exist for future normalized observations but are not yet wired into the API.

Migration path:

1. Ingest raw provider responses into `raw_price_observations`.
2. Normalize rows into `normalized_price_observations`.
3. Calculate queryable windows into `price_snapshots`.
4. Move `/api/search` price fields from `wine_prices` to `price_snapshots`.
5. Keep missing market fields as `unavailable` until provider-backed observations exist.

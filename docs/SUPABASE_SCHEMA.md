# BurgReport Supabase Schema Foundation

This document describes the target backend truth-model schema. It does not require a live Supabase connection for local tests.

The backend should run with local reference-data fallback when Supabase env vars are missing. `SUPABASE_SERVICE_KEY` is backend-only and must never be exposed to the frontend.

## Core Tables

- `climats`: canonical Grand Cru reference data.
- `climat_aliases`: normalized aliases such as `La Tache` -> `La Tâche`.
- `vintages`: reference vintage context.
- `merchants`: merchant/source registry.
- `raw_price_observations`: raw ingested price/source payloads.
- `normalized_price_observations`: normalized bottle-level observations linked to climats and merchants.
- `price_snapshots`: calculated market windows from normalized observations.

Live market fields require real observations. Missing market fields should be returned as `unavailable`, not synthesized.

See `supabase/migrations/20260425000000_truth_model_foundation.sql` for the initial migration foundation.

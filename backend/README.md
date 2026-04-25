# BurgReport Backend

FastAPI backend for BurgReport pricing and Grand Cru reference endpoints.

## OpenAI search integration

The backend now uses OpenAI for the fallback search/provider layer:

- `OPENAI_API_KEY` is required for OpenAI-backed lookups.
- `OPENAI_MODEL` defaults to `gpt-5` when unset.
- The OpenAI service is loaded lazily so the API can still boot without a key.
- Missing, unparseable, or unsupported OpenAI values return `null`/empty fields rather than synthetic market data.

The frontend and backend must not fabricate prices, merchants, source counts, confidence scores, price history, or comparables. If a value is not returned by a trusted source path, it should remain unavailable.

## CORS

Allowed origins are configured with `CORS_ORIGINS`:

```bash
CORS_ORIGINS=http://localhost:3000,https://burgreport.com,https://www.burgreport.com
```

If `CORS_ORIGINS` is unset, the backend allows localhost development origins only. The backend should not default to wildcard CORS.

## Truth model

The backend is the source of truth for field-level data status. New normalized responses should use:

- `live` only for real backend-returned observations.
- `reference` for static climat and vintage context.
- `unavailable` for missing market data.
- `estimated` only when an explicit methodology and config enable it.
- `example` only for explicit example/docs payloads, not normal production search.

`/api/search` currently preserves the legacy response shape and adds a `truth` block with field-level status metadata.

## Local validation

From `backend/`:

```bash
python -m py_compile main.py routers/search.py routers/wines.py routers/vintages.py services/openai_search.py services/supabase_client.py services/airtable.py services/reference_data.py models/common.py refresh_prices.py
python -m unittest discover -s tests -v
```

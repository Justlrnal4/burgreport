# BurgReport Backend

FastAPI backend for BurgReport pricing and Grand Cru reference endpoints.

## OpenAI search integration

The backend now uses OpenAI for the fallback search/provider layer:

- `OPENAI_API_KEY` is required for OpenAI-backed lookups.
- `OPENAI_MODEL` defaults to `gpt-5` when unset.
- The OpenAI service is loaded lazily so the API can still boot without a key.
- Missing, unparseable, or unsupported OpenAI values return `null`/empty fields rather than synthetic market data.

The frontend and backend must not fabricate prices, merchants, source counts, confidence scores, price history, or comparables. If a value is not returned by a trusted source path, it should remain unavailable.

## Local validation

From `backend/`:

```bash
python -m py_compile main.py routers/search.py routers/wines.py routers/vintages.py services/openai_search.py services/supabase_client.py services/airtable.py refresh_prices.py
python -m unittest discover -s tests
```

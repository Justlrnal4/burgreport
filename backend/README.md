# BurgReport Backend

FastAPI backend for BurgReport pricing and Grand Cru reference endpoints.

## OpenAI search integration

The backend now uses OpenAI for the fallback search/provider layer:

- `OPENAI_API_KEY` is required for OpenAI-backed lookups.
- `OPENAI_SEARCH_MODEL` defaults to `gpt-4.1-mini` for price lookups that use web search.
- `OPENAI_MODEL` defaults to `gpt-4.1-mini` for non-search fallback context. Set either model variable to `gpt-5` (or any `o1`/`o3`/`o4`-series model) to enable reasoning effort; the code only passes `reasoning` for reasoning-capable model families.
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

## Scheduled Supabase refresh

`refresh_prices.py` can run from a mini PC and update Supabase directly. The live Railway API reads `wine_prices` before calling OpenAI, so cached rows from the mini PC are immediately available to `/api/search`.

For a free-tier search setup, use Tavily:

```bash
cd ~/burgreport/backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
```

Fill `.env` with `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `TAVILY_API_KEY`. Then test one small batch:

```bash
.venv/bin/python refresh_prices.py --provider tavily --limit 3 --sleep-seconds 2 --state-file ~/.cache/burgreport/refresh-state.json
```

Recommended cron for roughly 900 Tavily searches/month:

```cron
15 */8 * * * cd ~/burgreport/backend && ./.venv/bin/python refresh_prices.py --provider tavily --limit 10 --sleep-seconds 2 --state-file ~/.cache/burgreport/refresh-state.json >> ~/.cache/burgreport/refresh.log 2>&1
```

The worker only upserts successful direct USD price parses. Failed searches, rate limits, or no-price snippets do not overwrite existing cached prices.

## Local validation

From `backend/`:

```bash
python -m py_compile main.py routers/search.py routers/wines.py routers/vintages.py services/openai_search.py services/tavily_search.py services/supabase_client.py services/airtable.py services/reference_data.py models/common.py refresh_prices.py
python -m unittest discover -s tests -v
```

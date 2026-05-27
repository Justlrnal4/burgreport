# BurgReport

Bloomberg Terminal for Burgundy — pricing intelligence for all 33 Grand Cru climats.

**Live:** [burgreport.com](https://burgreport.com)
**API:** [burgreport-production.up.railway.app](https://burgreport-production.up.railway.app) ([/docs](https://burgreport-production.up.railway.app/docs))

## Stack

- **Backend:** Python 3.12 + FastAPI on Railway. Routers for `search`, `wines`, `vintages`.
- **AI layer:** OpenAI Responses API with the `web_search` tool. Pulls live pricing from wine-searcher.com, vivino.com, wine.com, klwines.com, wineaccess.com, totalwine.com.
- **Cache:** Supabase Postgres, 24-hour TTL on price snapshots.
- **Content:** Airtable REST API for curated climat descriptions, producers, and pairings (1-hour in-memory cache).
- **Frontend:** Lovable-managed React SPA on Cloudflare. Not tracked in this repo.
- **Refresh:** Nightly Railway cron (`0 3 * * *`) iterates 33 climats × 5 vintages = 165 price lookups per night.

## Repo layout

```
backend/                  Python FastAPI app — canonical code path
  README.md               Backend-specific setup
  Procfile                Railway entry point
  routers/                FastAPI routes
  services/               OpenAI, Supabase, Airtable, reference data
  models/                 Pydantic models + truth-status enum
  refresh_prices.py       Nightly cron entry point
  tests/                  Unit tests
supabase/migrations/      Tracked DB migrations
docs/                     DATA_STATUS_MODEL, SUPABASE_SCHEMA, PRODUCTION_READINESS_CHECKLIST
burgreport-next-vercel-v2/  LEGACY — see CLAIM.md inside; not part of canonical stack
```

## Setup

See [`backend/README.md`](backend/README.md) for backend setup, environment variables, and local validation steps.

Required env vars on Railway: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`. `OPENAI_MODEL` defaults to `gpt-4o`; set to `gpt-5` or an o-series model to enable reasoning effort.

## Status

Live with caveats — see `docs/PRODUCTION_READINESS_CHECKLIST.md` for the current blockers. The most recent audit + remediation pass is at `~/Documents/Justin Main/09 - Decisions & Change Log/audit-2026-05-26T095327Z-burgreport/` (private to the maintainer).

## Truth model

The backend never fabricates prices, merchants, source counts, confidence scores, or comparables. Missing values stay `unavailable` rather than being substituted. See `docs/DATA_STATUS_MODEL.md`.

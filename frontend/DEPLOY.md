# BurgReport Web — Deploy / Hand-off

Canonical Next.js (15.5 / React 19) frontend for BurgReport, migrated out of the
Lovable setup on 2026-06-03. Server-rendered terminal UI wired to the FastAPI
backend. Consumes the backend's honesty fields (`truth.quality`, `defense`) and
renders the result-quality badge + "Defend this price" panel.

Was previously parked under a local archive folder; moved here and
verified (`npm run build` → 46 routes, typecheck clean).

## Local dev

```bash
npm install          # node_modules already present, but safe to refresh
npm run dev          # http://localhost:3000
```

Backend target resolution (`lib/api/burgreport.ts`):
- Defaults to the live backend `https://burgreport-production.up.railway.app`.
- Override with `BURGREPORT_API_URL=http://localhost:8000` to point at a local backend.

```bash
npm run build && npm run typecheck   # both must pass before deploy
```

## Deploy to Vercel

1. Put this directory in a Git repo (standalone repo, or fold into the backend
   repo and set Vercel's **Root Directory** to this folder).
2. Vercel → New Project → import the repo → framework auto-detects **Next.js**.
3. Env var (optional — this is already the default):
   `BURGREPORT_API_URL=https://burgreport-production.up.railway.app`
4. Deploy → you get a `*.vercel.app` preview URL. Verify it there FIRST.

### Order of operations (important)

> Full backend+frontend+DNS+rollback runbook: [`../docs/DEPLOY_RUNBOOK.md`](../docs/DEPLOY_RUNBOOK.md).

1. **Deploy the BACKEND first.** The quality badge + defense panel only appear
   once the backend serves `truth.quality` and `defense`. As of 2026-06-22 those
   changes are **committed** on branch `feat/honesty-layer-and-next-frontend`
   (`a253f32`) but **not yet deployed** to Railway. Push/merge → Railway redeploys
   → the live API gains the fields. Until then the frontend still works but those
   two pieces stay hidden (graceful).
2. **Deploy this frontend to Vercel**, verify on the `*.vercel.app` URL.
3. **CORS:** not required for the main search flow — this app fetches the backend
   **server-side** (server components, `lib/api` is `server-only`), so the browser
   never calls the backend directly. No `CORS_ORIGINS` change needed unless you
   add client-side fetches later.
4. **DNS cutover (do last, hardest to reverse):** point `burgreport.com` at Vercel
   (away from Cloudflare/Lovable). The Lovable site stays live until you do this,
   so you can compare both side by side first.

## What's wired to the backend

- `components/data-quality/ResultQualityBadge.tsx` ← `response.truth.quality`
  (confidence colored gray/amber/cream — never green; web-parsed prices are never
  presented as authoritative).
- `components/search-terminal/PriceDefensePanel.tsx` ← `response.defense`
  (sourced bullet points with provenance chips + copy-ready summary + caveat).
- The rest of the terminal already consumed the legacy `price`/`climat`/`vintage`
  blocks and is honest about unavailable fields.

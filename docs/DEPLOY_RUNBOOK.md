# BurgReport Deploy Runbook — Honesty Layer + Next Frontend

**Scope:** Ship branch `feat/honesty-layer-and-next-frontend` (backend honesty layer +
migrated Next/Vercel frontend) to production, replacing the Lovable site.
**Author of this pass:** verification + runbook prep, 2026-06-22. Nothing here has been
pushed or deployed — this is the trigger list for Justin.

> Hard rule: every push / merge / deploy / DNS change below is **Justin-only**. The repo
> work is staged and verified; Justin pulls the trigger.

---

## 0. What is being shipped (the live-vs-branch gap, verified 2026-06-22)

| | Live (Railway + Lovable) | Branch `feat/honesty-layer-and-next-frontend` |
|---|---|---|
| `truth.quality` | absent | present (ordinal tier + factors, confidence capped at "moderate") |
| `defense` block | absent | present ("Defend this price", grounded points + sources) |
| `price.data_quality` | absent | present |
| `sources` | raw `([domain](url?utm_source=openai))` | cleaned bare URLs (utm stripped, own-domain dropped, deduped) |
| Frontend | Lovable React SPA (Cloudflare) | Next 15 / React 19 SSR app (`frontend/`) |

**Branch state:** 2 commits ahead of `origin/main` (`a253f32` backend honesty layer,
`f51fef9` Next frontend) **plus** uncommitted working-tree edits in `frontend/`
(merchant source-link presentation fix — see §1). Commit those before deploying the frontend.

**Why no cache migration is needed:** the price sanitizer runs on BOTH paths —
`openai_search.get_wine_price` sanitizes before caching (`openai_search.py:199`) and
`search.py:51` re-sanitizes legacy cached rows on read. Deploying the backend cleans every
response (hit or miss) immediately.

---

## 1. Pre-flight: commit the staged frontend fix

Working tree has 3 edited files (raw-URL → clean-domain merchant presentation, shared
`prettyDomain`):
- `frontend/lib/utils/format.ts` (add `prettyDomain`)
- `frontend/lib/api/burgreport.ts` (`normalizeMerchants` shows domain + real link)
- `frontend/components/search-terminal/PriceDefensePanel.tsx` (use shared helper)

```bash
cd /home/justin/projects/burgreport
git add frontend/lib/utils/format.ts frontend/lib/api/burgreport.ts \
        frontend/components/search-terminal/PriceDefensePanel.tsx
git commit -m "frontend: present merchant sources as clean domains with links"
```

Green-gate before anything leaves the machine:
```bash
cd backend && source .venv/bin/activate && pytest          # expect 43 passed
cd ../frontend && npm run lint && npm run typecheck && npm run build   # all pass
```

---

## 2. Order of operations (do NOT reorder)

1. **Backend → Railway first.** The quality badge + defense panel only appear once the API
   serves `truth.quality` + `defense`. Frontend degrades gracefully without them, but ship
   backend first so preview shows the real thing.
2. **Frontend → Vercel preview** (`*.vercel.app`), verify there.
3. **DNS cutover last** (hardest to reverse). Lovable stays live until DNS moves, so both can
   be compared side by side.

---

## 3. Backend deploy → Railway

**Confirm first (Justin):** which branch Railway's BurgReport service deploys from. There is
no `railway.json`/`railway.toml` in the repo — branch + build are configured in the Railway
dashboard. Two cases:

- **Railway tracks `main`:** merge the feature branch, then push.
  ```bash
  git checkout main && git merge --ff-only feat/honesty-layer-and-next-frontend
  git push origin main          # Railway auto-builds if GitHub deploys are on
  ```
- **Railway tracks the feature branch / manual:** push the branch and trigger from the
  dashboard, or `railway up` from `backend/` with the Railway CLI.

**Build:** Nixpacks autodetect → `requirements.txt` (Python 3.12 via `runtime.txt`) →
Procfile `web: uvicorn main:app --host 0.0.0.0 --port $PORT`.

**Required Railway env vars** (values already in `backend/.env`, never commit them):
`OPENAI_API_KEY`, `OPENAI_SEARCH_MODEL`, `OPENAI_MODEL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_KEY`, `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_GRAND_CRUS_TABLE`,
`AIRTABLE_VINTAGES_TABLE`, `CORS_ORIGINS`. (`TAVILY_API_KEY` optional fallback.)

**Verify the deploy (see §6 checklist).** Backend is done when `/api/search` returns
`truth.quality` + `defense` and sources have no `utm_` params.

---

## 4. Frontend deploy → Vercel (preview first)

The repo is a monorepo (`backend/` + `frontend/`), so set Vercel **Root Directory = `frontend/`**.

1. Vercel → New Project → import `Justlrnal4/burgreport`.
2. **Root Directory: `frontend`** (critical — else it builds the repo root).
3. Framework auto-detects **Next.js**. `frontend/vercel.json` pins region `iad1`.
4. Env vars (Production + Preview):
   - `BURGREPORT_API_URL=https://burgreport-production.up.railway.app` (server-side fetch target)
   - `NEXT_PUBLIC_SITE_URL=https://burgreport.com`
   - `NEXT_PUBLIC_API_URL=https://burgreport-production.up.railway.app`
   - `BR_ENABLE_ESTIMATED_MARKET_DATA=false` (keep estimates off — honest default)
   - `NEXT_PUBLIC_VERCEL_ANALYTICS=false` (or true if wanted)
5. Deploy → get `*.vercel.app`. **Verify there first** (§6).

**CORS:** not required for the search flow — the app fetches the backend **server-side**
(`lib/api/burgreport.ts` is `server-only`), so the browser never calls Railway directly.

---

## 5. DNS cutover (last, hardest to reverse)

Currently `burgreport.com` → Cloudflare → Lovable. Cutover points it at Vercel.

1. Confirm DNS provider/registrar for `burgreport.com` (Cloudflare per project notes — verify).
2. Add `burgreport.com` (+ `www`) as a domain on the Vercel project; follow Vercel's
   A/CNAME instructions.
3. Keep the Lovable deploy live during propagation so you can compare.
4. After propagation, run the §6 checklist against `https://burgreport.com`.
5. Only after the live site passes: decommission the Lovable project. BurgReport's Lovable
   frontend is a thin React SPA over the FastAPI backend — it has **no separate Supabase of its
   own**, so there is nothing to export from it. The only Supabase is the backend's (on Railway),
   which is unchanged by this cutover. Archive/cancel Lovable once DNS has soaked on Vercel.

---

## 6. Post-deploy verification checklist (re-check live each stage)

**Backend (Railway) — after §3:**
```bash
curl -s https://burgreport-production.up.railway.app/health
curl -s "https://burgreport-production.up.railway.app/api/search?wine_name=Chambertin&vintage=2021" \
| python3 -c "import sys,json; d=json.load(sys.stdin); \
print('truth.quality:', 'quality' in d.get('truth',{})); \
print('defense:', 'defense' in d); \
print('price.data_quality:', 'data_quality' in d.get('price',{})); \
s=d['price'].get('sources',[]); \
print('sources clean (no utm):', not any('utm_' in x for x in s)); \
print('sources not markdown:', not any(str(x).strip().startswith('(') for x in s))"
```
Pass = `truth.quality: True`, `defense: True`, `price.data_quality: True`, sources clean.

**Frontend (`*.vercel.app`, then `burgreport.com`) — after §4 / §5:**
```bash
URL="https://<preview>.vercel.app"   # then re-run with https://burgreport.com
curl -s "$URL/search?wine=Chambertin&vintage=2021" | grep -c "Defend this price"   # >=1
curl -s "$URL/search?wine=Chambertin&vintage=2021" | grep -c "utm_source"          # 0
curl -s "$URL/search?wine=Chambertin&vintage=2021" | grep -c "\$0"                  # 0 phantom prices
```
Visual: load `/search?wine=Chambertin&vintage=2021` and confirm: data-quality badge is
gray/amber/cream (never green), "Defend this price" panel renders, merchant rows show clean
domains (not raw URLs), Price history / Comparables show "Unavailable" (not fabricated).

**Honesty regression spot-checks:** no "Powered by Wine-Searcher", no green "LIVE
authoritative" price, no merchant table with fabricated per-merchant prices, no critic scores.

---

## 7. Rollback

- **Backend:** Railway keeps deployment history → in the dashboard, redeploy the previous
  successful deployment (instant). Or `git revert <merge>` + push. The old code is honest too
  (it just lacks the new fields); rolling back loses the badge/defense, not safety.
- **Frontend / DNS:** the highest-risk step is DNS. Because cutover is preview-first, rollback
  = point `burgreport.com` DNS back to Cloudflare/Lovable (TTL-bound). Keep Lovable live until
  the Vercel site has soaked. Vercel itself supports instant rollback to a prior deployment.
- **Fast path if the live site misbehaves post-DNS:** revert DNS to Lovable first (restores a
  known-good site in minutes), then debug Vercel out of the critical path.

---

## 8. Open items for Justin (not blocking the code, but his call)

- Which branch Railway deploys from (drives §3 merge-vs-push).
- DNS registrar/provider confirmation for the §5 cutover.
- Whether to keep `BR_ENABLE_ESTIMATED_MARKET_DATA=false` (recommended — honest default).
- Supabase RLS on the last 2 tables (`wine_prices`, `search_log`) — tracked in
  `REMEDIATION_BRIEF_2026-05-29.md`, independent of this deploy.

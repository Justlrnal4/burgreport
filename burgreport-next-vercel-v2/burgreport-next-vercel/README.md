# BurgReport — Next.js/Vercel Frontend

Clean Next.js App Router rebuild for moving BurgReport off Lovable and onto Vercel.

This version is built from the April 2026 Lovable frontend audit and the current BurgReport brand direction: dark Burgundy terminal, wine red, gold, cream typography, and data-forward trust labels.

## What this version fixes

- No unlabeled fabricated merchant prices.
- No fake `LIVE` labels.
- No lobster/food-pairing hack for wine color or grape.
- No dead Grand Cru Guide link.
- No client-side service keys.
- No duplicated Lovable pages or orphaned components.
- Share URLs point to `/search?...`.
- Search URLs are shareable and search-result variants are `noindex` to avoid duplicate SEO.
- Grand Cru guide pages are static, canonical, and indexable.
- Missing backend history/merchant/comparable data is shown as unavailable instead of invented.
- Optional estimated market context is disabled by default and must be explicitly enabled.

## Stack

- Next.js App Router
- React 19
- TypeScript strict mode
- Tailwind CSS brand tokens
- Vercel-ready route handlers for API proxying
- Server-rendered search results where possible
- Client island for autocomplete, sharing, and fairness input
- ESLint flat config with `eslint-config-next/core-web-vitals` and TypeScript rules

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Validate before pushing

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment variables

```bash
NEXT_PUBLIC_SITE_URL=https://burgreport.com
BURGREPORT_API_URL=https://burgreport-production.up.railway.app
NEXT_PUBLIC_API_URL=https://burgreport-production.up.railway.app
BR_ENABLE_ESTIMATED_MARKET_DATA=false
```

`BURGREPORT_API_URL` is used server-side. Do not place private backend secrets in variables prefixed with `NEXT_PUBLIC_`.

## Key routes

- `/` — landing page
- `/search` — wine search and result page
- `/grand-cru` — index of all 33 Grand Cru climats
- `/grand-cru/[slug]` — static Grand Cru guide pages
- `/vintages` — vintage guide starter
- `/api/wines` — Next proxy for backend wines endpoint
- `/api/search` — Next proxy for backend search endpoint
- `/api/health` — backend health proxy

## Migration approach

1. Freeze Lovable as visual reference.
2. Capture screenshots and raw API JSON snapshots.
3. Push this code to the canonical GitHub repo.
4. Deploy a Vercel Preview.
5. Compare Lovable vs Vercel route-by-route.
6. Lock backend API contracts.
7. Only cut DNS after parity QA passes.

## Backend contract priorities

- `/api/wines` should include `color`, `cote`, `grape`, `is_monopole`, and `slug`.
- `/api/search` should return `price.history` and `comparables`, or explicitly return `null`.
- Merchant/source data should be a typed array, not fabricated in the frontend.
- Vintage data should separate Côte de Nuits and Côte de Beaune.

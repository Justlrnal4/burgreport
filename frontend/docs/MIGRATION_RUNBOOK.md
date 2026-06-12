# BurgReport Next/Vercel Migration Runbook

## Phase 0 — Freeze Lovable reference

- Capture screenshots of `/`, `/search` empty state, loading state, success state, error state, and mobile state.
- Capture raw JSON from `/api/wines`, `/api/search?wine_name=Chambertin&vintage=2019`, and `/health`.
- Save Lovable `index.css`, logo SVG/component, and any current brand references.
- Stop adding new features to Lovable except fixes that unblock export or trust.

## Phase 1 — Canonical repo

- Pick one GitHub repo as source of truth.
- Push this Next.js codebase.
- Add `.env.local` locally and Vercel environment variables in Preview + Production.
- Do not commit `.env.local`.

## Phase 2 — Preview deploy

- Import the repo into Vercel.
- Set `BURGREPORT_API_URL` and `NEXT_PUBLIC_SITE_URL`.
- Deploy Preview.
- Run parity QA before touching DNS.

## Phase 3 — DNS cutover

- Lower current DNS TTL to 60s at least 24 hours before cutover.
- Confirm Vercel Preview and Production envs are configured.
- Promote to Production.
- Point `burgreport.com` to Vercel.
- Keep Lovable live for rollback for at least 7 days.

## Rollback

- Revert DNS to Lovable host.
- Keep backend unchanged.
- Check `/api/health` after rollback.

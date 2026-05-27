# LEGACY — NOT CANONICAL

This directory is **not** part of the BurgReport canonical stack.

## What this is

An earlier Next.js + Vercel prototype that predates the current Python FastAPI + Railway backend. It is preserved in-repo as a historical artifact only.

## What the canonical stack actually is

- **Backend:** Python FastAPI on Railway (`/backend/` in this repo)
- **Frontend:** Lovable-managed React SPA on Cloudflare (not tracked in this repo)
- **AI layer:** OpenAI web search via OpenAI Responses API
- **Cache:** Supabase Postgres (24-hour TTL)
- **Content:** Airtable REST API
- **Live at:** burgreport.com (frontend) / `burgreport-production.up.railway.app` (backend)

## Do not

- Frame BurgReport's stack as "Next.js + Vercel" — this is the misframing trap this directory has caused at least once before.
- Import from this directory in canonical backend code.
- Deploy this directory to production.
- Treat `node_modules/` here as anything but build artifact noise (it is checked in, which is itself a hygiene issue tracked in the 2026-05-26 audit).

## Status

Decision pending: delete, move out of repo, or keep with this marker. As of 2026-05-26 the cheapest reversible step (this `CLAIM.md`) is in place. The full archive call is deferred to Justin.

## Audit reference

`~/Documents/Justin Main/09 - Decisions & Change Log/audit-2026-05-26T095327Z-burgreport/`

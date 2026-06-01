# BurgReport Remediation Brief — 2026-05-29 (rev 2, post-audit)
For the agent team. Goal: bring BurgReport to an honest, secure, portfolio-eligible state. Scope is bounded. Read GUARDRAILS before touching any UI text or copy.

> rev 2 corrects rev 1, which carried stale "OpenAI key missing" and "fix 33→34" items. Both were wrong: live pricing works and the count is already 34 everywhere. Verify live before acting on any claim in older docs.

## Verified context (live + 5-agent audit, 2026-05-29)
- API up: `/health` ok. `/api/wines` returns **34** climats.
- **Live pricing WORKS:** `/api/search?wine_name=Chambertin&vintage=2021` returned real prices (`data_source: openai_web_search`, avg $2,500). OpenAI key is set and has quota.
- **Backend is honest:** truth model returns `history`, `merchantCoverage`, `comparables`, critic scores, and `confidence` as `unavailable`. The real frontend shows "unavailable" panels correctly.
- **Data integrity already clean:** "34" everywhere; backend `reference_data.py` (34) and frontend `lib/data/grand-crus.ts` (34) are in sync. No active "33" references. NO fix needed.
- The portfolio demo screenshots (56 merchants, price history, 97pt scores, "Powered by Wine-Searcher") show data the backend does NOT produce. Demo/mock only.

## IN SCOPE (do these)
1. **Security — finish enabling RLS on the last 2 tables (TOP PRIORITY).**
   - RLS is now applied on 12 of 14 tables (migration applied as version `20260530022425`). The only remaining RLS gap is enabling it on `wine_prices` + `search_log`.
   - This is blocked on setting the Railway `SUPABASE_SERVICE_KEY` (legacy service_role JWT) FIRST (or cache upserts/log inserts start failing silently once RLS is on for those two tables).
   - Once the service key is set, enable RLS on `wine_prices` + `search_log`, then run the post-apply verification queries in the migration footer.
   - Done when: all 14 tables show `rowsecurity=true`; anon write is rejected; intended reads still work.
2. **Remove the "Powered by Wine-Searcher" false claim.**
   - There is no Wine-Searcher API integration. Wine-Searcher is only one of Tavily's `DEFAULT_DOMAINS` (`tavily_search.py:22`).
   - Remove/reword "Powered by Wine-Searcher" and "Source: Wine-Searcher" in the frontend and the misleading README line (`README.md:11`). Attribute to "web search (OpenAI / Tavily over public merchant pages)" instead.
   - Done when: no "Wine-Searcher" provider/branding claim appears in UI, copy, or README.
3. **Surface price confidence honestly.**
   - Prices come from unvalidated web-search parsing (can capture wrong vintage/currency/case prices). The backend already marks `confidence: "unavailable"`, but the UI shows a green "LIVE" badge.
   - Change display: label web-sourced prices "unvalidated — verify with merchant," surface merchant count + source URLs (Tavily already returns these), and show cache `fetched_at` age.
   - Done when: no price is presented as authoritative "live market data" without the unvalidated/verify caveat.
4. **Archive the dead legacy directory.**
   - `burgreport-next-vercel-v2/` (~664 MB, node_modules checked in) is marked non-canonical via `CLAIM.md`. Move it out of the repo or delete.

## OWNER-ONLY (Justin, not agents)
- Monitor OpenAI billing/quota (it works now; a prior `openai_rate_limit` on an off-list vintage suggested tight quota). Keep credits funded.
- Decide whether to ever wire a licensed price source (Wine-Searcher / Liv-ex). OPTIONAL — not required to ship honestly, since prices can be presented as unvalidated web-sourced.
- Re-screenshot the REAL live app for the portfolio (real prices + honest "unavailable" panels). Do NOT use the demo screenshots.

## GUARDRAILS (hard — do not violate)
- DO NOT claim "Powered by Wine-Searcher," named-merchant tables, price history/trends, critic scores, comparables, or "updates daily" — the backend produces none of these.
- DO NOT present web-search-parsed prices as validated/authoritative. Label them unvalidated.
- Any demo/seed values in the UI MUST carry the `example` status label.
- Do not invent metrics.

## OUT OF SCOPE
- Building a licensed price-source integration (owner decision; not required for honest shipping).
- Generating the portfolio PDF (gated on: RLS deployed + Wine-Searcher branding removed + real-app screenshots taken; see PORTFOLIO_MASTER_DESIGN_SPEC.md Asset 6).

## DEFINITION OF DONE (portfolio eligibility — honest truth-model framing)
- RLS deployed and verified.
- "Powered by Wine-Searcher" removed everywhere.
- Prices labeled unvalidated; sources surfaced.
- Legacy dir archived.
- Real-app screenshots captured (not demo data).
(Already satisfied: live pricing works; 34 everywhere; backend truth model honest.)

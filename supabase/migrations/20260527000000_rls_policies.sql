-- RLS policies for all 14 application tables.
--
-- PRECONDITION — verify before applying:
-- The backend (services/supabase_client.py) tries SUPABASE_SERVICE_KEY first and
-- falls back to SUPABASE_ANON_KEY. Service-role keys bypass RLS entirely; anon
-- keys are subject to these policies. Confirm SUPABASE_SERVICE_KEY is set on
-- Railway BEFORE applying — otherwise wine_prices upserts and search_log inserts
-- will start failing silently (caught by the exception handlers, but the cache
-- will stop populating and telemetry will stop logging).
--
-- Three groups of policies:
--   1. Public reference  — anon + authenticated can SELECT (writes via service_role)
--      grand_crus, vintage_ratings, climats, climat_aliases, vintages,
--      merchants, price_snapshots
--   2. Backend-only      — no policies for anon/authenticated (service_role bypasses)
--      wine_prices, search_log, raw_price_observations, normalized_price_observations
--   3. User-owned        — auth.uid() scoped SELECT/INSERT/UPDATE/DELETE
--      user_profiles, watchlist, cellar_entries
--
-- The 3 user-owned tables already have RLS enabled (baseline migration) but
-- zero policies — meaning they are currently locked to all clients including
-- authenticated users. This migration adds the missing policies AND enables
-- RLS on the 11 still-disabled tables in a single transaction.

begin;

-- ─── Phase 1: enable RLS on the 11 previously-disabled tables ────────────────

alter table public.grand_crus                     enable row level security;
alter table public.wine_prices                    enable row level security;
alter table public.vintage_ratings                enable row level security;
alter table public.search_log                     enable row level security;
alter table public.climats                        enable row level security;
alter table public.climat_aliases                 enable row level security;
alter table public.vintages                       enable row level security;
alter table public.merchants                      enable row level security;
alter table public.raw_price_observations         enable row level security;
alter table public.normalized_price_observations  enable row level security;
alter table public.price_snapshots                enable row level security;

-- user_profiles, watchlist, cellar_entries: RLS already enabled by baseline

-- ─── Phase 2: drop any existing policies of the same name (idempotency) ──────

drop policy if exists "public read grand_crus"                    on public.grand_crus;
drop policy if exists "public read vintage_ratings"               on public.vintage_ratings;
drop policy if exists "public read climats"                       on public.climats;
drop policy if exists "public read climat_aliases"                on public.climat_aliases;
drop policy if exists "public read vintages"                      on public.vintages;
drop policy if exists "public read merchants"                     on public.merchants;
drop policy if exists "public read price_snapshots"               on public.price_snapshots;

drop policy if exists "owner select user_profiles"                on public.user_profiles;
drop policy if exists "owner insert user_profiles"                on public.user_profiles;
drop policy if exists "owner update user_profiles"                on public.user_profiles;
drop policy if exists "owner delete user_profiles"                on public.user_profiles;

drop policy if exists "owner select watchlist"                    on public.watchlist;
drop policy if exists "owner insert watchlist"                    on public.watchlist;
drop policy if exists "owner update watchlist"                    on public.watchlist;
drop policy if exists "owner delete watchlist"                    on public.watchlist;

drop policy if exists "owner select cellar_entries"               on public.cellar_entries;
drop policy if exists "owner insert cellar_entries"               on public.cellar_entries;
drop policy if exists "owner update cellar_entries"               on public.cellar_entries;
drop policy if exists "owner delete cellar_entries"               on public.cellar_entries;

-- ─── Phase 3a: public reference tables — anon + authenticated SELECT ─────────

create policy "public read grand_crus"
    on public.grand_crus
    for select to anon, authenticated
    using (true);

create policy "public read vintage_ratings"
    on public.vintage_ratings
    for select to anon, authenticated
    using (true);

create policy "public read climats"
    on public.climats
    for select to anon, authenticated
    using (true);

create policy "public read climat_aliases"
    on public.climat_aliases
    for select to anon, authenticated
    using (true);

create policy "public read vintages"
    on public.vintages
    for select to anon, authenticated
    using (true);

create policy "public read merchants"
    on public.merchants
    for select to anon, authenticated
    using (true);

create policy "public read price_snapshots"
    on public.price_snapshots
    for select to anon, authenticated
    using (true);

-- ─── Phase 3b: backend-only tables — no policies ─────────────────────────────
-- wine_prices, search_log, raw_price_observations, normalized_price_observations
-- are accessed only by the backend with the service_role JWT, which bypasses
-- RLS. No anon/authenticated policies = no access for those roles.

-- ─── Phase 3c: user-owned tables — auth.uid() scoped ─────────────────────────

-- user_profiles.id IS the auth.users(id), so scope on id (not user_id)
create policy "owner select user_profiles"
    on public.user_profiles
    for select to authenticated
    using (auth.uid() = id);

create policy "owner insert user_profiles"
    on public.user_profiles
    for insert to authenticated
    with check (auth.uid() = id);

create policy "owner update user_profiles"
    on public.user_profiles
    for update to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

create policy "owner delete user_profiles"
    on public.user_profiles
    for delete to authenticated
    using (auth.uid() = id);

create policy "owner select watchlist"
    on public.watchlist
    for select to authenticated
    using (auth.uid() = user_id);

create policy "owner insert watchlist"
    on public.watchlist
    for insert to authenticated
    with check (auth.uid() = user_id);

create policy "owner update watchlist"
    on public.watchlist
    for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "owner delete watchlist"
    on public.watchlist
    for delete to authenticated
    using (auth.uid() = user_id);

create policy "owner select cellar_entries"
    on public.cellar_entries
    for select to authenticated
    using (auth.uid() = user_id);

create policy "owner insert cellar_entries"
    on public.cellar_entries
    for insert to authenticated
    with check (auth.uid() = user_id);

create policy "owner update cellar_entries"
    on public.cellar_entries
    for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "owner delete cellar_entries"
    on public.cellar_entries
    for delete to authenticated
    using (auth.uid() = user_id);

commit;

-- ─── Post-apply verification ─────────────────────────────────────────────────
-- After applying, run in the Supabase SQL editor:
--   select tablename, rowsecurity from pg_tables where schemaname='public';
--   select tablename, policyname, roles, cmd from pg_policies where schemaname='public';
-- Confirm:
--   • All 14 tables show rowsecurity = true
--   • 7 public-read policies (one per public reference table)
--   • 12 owner-scoped policies (4 each × 3 user tables)
--   • Backend still works: curl /api/wines (public read) and /api/search (cache write)
--     Cache write success = wine_prices row count increases after a fresh search

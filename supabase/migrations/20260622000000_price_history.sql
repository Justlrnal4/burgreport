-- Forward-accruing price-history trail (the cache-APPEND mechanic).
--
-- The 24h wine_prices cache OVERWRITES on (grand_cru_id, vintage), so it cannot
-- carry a time series. This table is APPEND-ONLY: every fresh estimate fetch
-- writes one immutable dated snapshot, so the trail compounds over time at zero
-- licensing cost. Each row carries its own source_count + confidence so a thin
-- point stays visibly thin and is never averaged into a false trend.
--
-- HONESTY: this is "our own cached estimate over time", NOT a market index.
-- It is keyed exactly like wine_prices (grand_cru_id TEXT + vintage), deliberately
-- sidestepping the separate UUID climat_id observation tables which the live
-- backend does not use.
--
-- PRECONDITION — same as the RLS migration: confirm SUPABASE_SERVICE_KEY is set
-- on Railway BEFORE applying. The backend writes via service_role (bypasses RLS);
-- with only the anon key, inserts fail silently and the trail never accrues.
-- Until this migration is applied, append_price_history() fails quietly by design.

begin;

create table if not exists public.price_history (
    id             bigint generated always as identity primary key,
    grand_cru_id   text not null,
    vintage        integer,
    avg_price_usd  numeric,
    min_price_usd  numeric,
    max_price_usd  numeric,
    source_count   integer,
    confidence     text,
    data_source    text,
    captured_at    timestamptz not null default now()
);

create index if not exists price_history_lookup
    on public.price_history (grand_cru_id, vintage, captured_at desc);

-- Backend-only table (group 2): RLS on, no anon/authenticated policies.
-- service_role bypasses RLS for the backend writer; everyone else is denied.
alter table public.price_history enable row level security;

commit;

-- Post-apply verification:
--   select relname, relrowsecurity from pg_class where relname = 'price_history';   -- expect t
--   select count(*) from public.price_history;                                      -- grows after live searches

-- Baseline migration: tables that existed in the live Supabase project
-- (aeblohadatnbftvfaltb / burg-report) before the truth-model migration
-- on 2026-04-25, but were never captured in tracked migrations. Created
-- by schema export on 2026-05-26 from the live DB.
--
-- All statements use IF NOT EXISTS so this is a no-op against the live
-- DB and safe to replay on fresh dev databases. RLS is intentionally
-- left disabled here to match live state; see PRODUCTION_READINESS_CHECKLIST.md
-- "Supabase Security" section for the RLS plan and known critical advisory.

-- Reference table: 33 Grand Crus (TEXT id, populated by app/seed)
create table if not exists public.grand_crus (
    id          text primary key,
    name        text not null,
    aoc         text,
    village     text,
    cote        text,
    size_ha     numeric,
    is_monopole boolean default false,
    color       text default 'Red',
    created_at  timestamptz default now(),
    slug        text not null,
    grape       text
);

-- Cache: per-(grand_cru, vintage) price snapshots from OpenAI web_search
create table if not exists public.wine_prices (
    id              uuid primary key default gen_random_uuid(),
    grand_cru_id    text references public.grand_crus(id),
    vintage         integer,
    avg_price_usd   numeric,
    min_price_usd   numeric,
    max_price_usd   numeric,
    merchant_count  integer,
    critic_score    numeric,
    critic_name     text,
    drinking_window text,
    sources         jsonb default '[]'::jsonb,
    confidence      text,
    data_source     text,
    fetched_at      timestamptz default now()
);
-- UNIQUE constraint required by supabase_client.set_cached_price() upsert
-- which uses on_conflict="grand_cru_id,vintage" (services/supabase_client.py:151).
-- Without this, fresh DB replays would 23P01 on the first cache write.
create unique index if not exists uniq_wine_prices_grand_cru_vintage
    on public.wine_prices(grand_cru_id, vintage);
create index if not exists idx_wine_prices_fetched_at
    on public.wine_prices(fetched_at);

-- Reference: vintage ratings per Burgundy zone
create table if not exists public.vintage_ratings (
    id    uuid primary key default gen_random_uuid(),
    year  integer not null,
    zone  text not null,
    stars integer,
    label text,
    note  text
);
create unique index if not exists uniq_vintage_ratings_year_zone
    on public.vintage_ratings(year, zone);

-- Telemetry: every /api/search call
create table if not exists public.search_log (
    id           uuid primary key default gen_random_uuid(),
    query        text,
    grand_cru_id text,
    vintage      integer,
    response_ms  integer,
    searched_at  timestamptz default now()
);
create index if not exists idx_search_log_searched_at
    on public.search_log(searched_at);

-- User-owned tables (RLS enabled in live state)
create table if not exists public.user_profiles (
    id         uuid primary key references auth.users(id),
    email      text,
    name       text,
    tier       text default 'free',
    created_at timestamptz default now()
);
alter table public.user_profiles enable row level security;

create table if not exists public.watchlist (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid references auth.users(id),
    grand_cru_id     text references public.grand_crus(id),
    vintage          integer,
    target_price_usd numeric,
    created_at       timestamptz default now()
);
alter table public.watchlist enable row level security;

create table if not exists public.cellar_entries (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid references auth.users(id),
    grand_cru_id       text references public.grand_crus(id),
    vintage            integer,
    purchase_price_usd numeric,
    quantity           integer default 1,
    purchase_date      date,
    notes              text,
    created_at         timestamptz default now()
);
alter table public.cellar_entries enable row level security;

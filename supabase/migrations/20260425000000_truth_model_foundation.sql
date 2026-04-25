create extension if not exists pgcrypto;

create table if not exists climats (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  village text not null,
  cote text not null,
  color text not null,
  grape text not null,
  size_ha numeric,
  is_monopole boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists climat_aliases (
  id uuid primary key default gen_random_uuid(),
  climat_id uuid not null references climats(id) on delete cascade,
  alias text not null,
  normalized_alias text not null,
  unique(normalized_alias)
);

create table if not exists vintages (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  region text not null,
  signal text,
  stars int,
  note text,
  source text not null default 'BurgReport reference dataset',
  unique(year, region)
);

create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  source_type text,
  active boolean not null default true
);

create table if not exists raw_price_observations (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  merchant_name text,
  raw_title text not null,
  raw_price text,
  currency text,
  observed_at timestamptz not null default now(),
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists normalized_price_observations (
  id uuid primary key default gen_random_uuid(),
  raw_observation_id uuid references raw_price_observations(id) on delete set null,
  climat_id uuid references climats(id) on delete set null,
  merchant_id uuid references merchants(id) on delete set null,
  producer_name text,
  vintage int,
  price_usd numeric,
  bottle_size_ml int not null default 750,
  availability text,
  confidence_notes text,
  normalized_at timestamptz not null default now()
);

create table if not exists price_snapshots (
  id uuid primary key default gen_random_uuid(),
  climat_id uuid references climats(id) on delete cascade,
  vintage int,
  average_usd numeric,
  low_usd numeric,
  high_usd numeric,
  observation_count int not null default 0,
  merchant_count int not null default 0,
  window_start timestamptz,
  window_end timestamptz,
  calculated_at timestamptz not null default now()
);

create index if not exists idx_climat_aliases_normalized_alias on climat_aliases(normalized_alias);
create index if not exists idx_normalized_price_observations_climat_vintage on normalized_price_observations(climat_id, vintage);
create index if not exists idx_price_snapshots_climat_vintage on price_snapshots(climat_id, vintage);

# API Contract Lock List

Before final migration, confirm these contracts with the backend.

## GET /api/wines

Expected response:

```ts
{
  count: number;
  wines: Array<{
    id: string | number;
    name: string;
    slug: string;
    village: string;
    cote: 'Côte de Nuits' | 'Côte de Beaune';
    color: 'Red' | 'White';
    grape: 'Pinot Noir' | 'Chardonnay';
    is_monopole: boolean;
    size_ha: number;
    key_producers?: string[];
    description?: string;
  }>;
}
```

## GET /api/search

Required params:

- `wine_name`
- `vintage` optional

Expected response:

```ts
{
  climat: {
    id: string | number;
    name: string;
    slug: string;
    village: string;
    cote: string;
    color: 'Red' | 'White';
    grape: 'Pinot Noir' | 'Chardonnay';
    size_ha: number;
    is_monopole: boolean;
    description: string;
    key_producers: string[];
  };
  price: {
    avg_usd: number | null;
    min_usd: number | null;
    max_usd: number | null;
    critic_score: number | null;
    drinking_window: string | null;
    sources: Array<{ merchant: string; priceUsd: number | null; url?: string; source: 'live' }> | null;
    history: Array<{ year: number; label: string; avgUsd: number; source: 'live' }> | null;
  };
  vintage: {
    year: number | null;
    stars: number | null;
    label: string | null;
    note: string | null;
  };
  meta: {
    cache_hit: boolean;
    response_ms: number;
    last_updated: string | null;
  };
}
```

## Current backend transition

The FastAPI backend now preserves the legacy `/api/search` response and adds an additive `truth` block with field-level status metadata. Frontend clients can migrate toward `truth` without breaking the older `climat`, `price`, `vintage`, and `meta` blocks.

## Target field-status contract

The backend should eventually become the source of truth for field-level status metadata. The current frontend safely maps the existing backend response into:

- backend-returned market fields → `live`
- static Grand Cru and vintage context → `reference`
- missing market fields → `unavailable`
- explicitly enabled calculated fields → `estimated`
- homepage/preview-only fields → `example`

The desired future API shape is:

```ts
type DataStatus = 'live' | 'estimated' | 'reference' | 'unavailable' | 'example';

type DataField<T> = {
  value: T | null;
  status: DataStatus;
  label?: string;
  source?: string;
  asOf?: string;
  note?: string;
};

type PricePoint = {
  year: number;
  label: string;
  avgUsd: number;
  source: DataStatus;
};

type MerchantCoverage = {
  merchant: string;
  priceUsd: number | null;
  url?: string;
  source: DataStatus;
};

type ComparableWine = {
  name: string;
  slug?: string;
  avgUsd: number | null;
  score: number | null;
  reason: string;
  source: DataStatus;
};

{
  climat: {
    name: DataField<string>;
    village: DataField<string>;
    cote: DataField<string>;
    grape: DataField<string>;
    color: DataField<string>;
    sizeHa: DataField<number>;
    isMonopole: DataField<boolean>;
  };
  price: {
    average: DataField<number>;
    low: DataField<number>;
    high: DataField<number>;
    currency: DataField<string>;
    history: DataField<PricePoint[]>;
    merchantCoverage: DataField<MerchantCoverage[]>;
  };
  comparables: DataField<ComparableWine[]>;
  vintage: {
    signal: DataField<string>;
    year: DataField<number>;
    stars?: DataField<number>;
    note?: DataField<string>;
  };
  meta: {
    cacheHit?: boolean;
    responseMs?: number;
    lastUpdated?: string | null;
  };
}
```

Frontend rule: missing market data must be rendered as unavailable. Do not fabricate price ranges, merchant coverage, source counts, confidence scores, price history, volatility rankings, or comparables to fill panels.

## GET /health

Expected response should return HTTP 200 while backend is healthy.

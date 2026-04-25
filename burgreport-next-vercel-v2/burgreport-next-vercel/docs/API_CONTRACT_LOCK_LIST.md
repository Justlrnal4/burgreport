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

## GET /health

Expected response should return HTTP 200 while backend is healthy.

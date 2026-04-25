# BurgReport Data Status Model

BurgReport's backend is the source of truth. The frontend must display what the backend returns and must not fill missing market data with synthetic values.

## Field Shape

```ts
type DataStatus = "live" | "estimated" | "reference" | "unavailable" | "example";

type DataField<T> = {
  value: T | null;
  status: DataStatus;
  label?: string;
  source?: string;
  as_of?: string;
  note?: string;
};
```

## Status Rules

- `live`: real backend-returned observation or calculation from stored observations.
- `reference`: static Burgundy reference context, such as climat name, village, grape, color, size, monopole status, or curated vintage context.
- `unavailable`: data category was considered but the backend does not have enough trusted data.
- `estimated`: explicitly configured estimate with documented methodology.
- `example`: illustrative examples only. Normal production search responses should not use this status.

## Forbidden Until Backed By Methodology

Do not fabricate prices, merchant quotes, source counts, confidence scores, price history, comparables, volatility rankings, critic breakdowns, daily update claims, Wine-Searcher claims, or real-time claims.

Price history, merchant coverage, comparables, confidence scores, and source counts require backend methodology and stored observations before display.

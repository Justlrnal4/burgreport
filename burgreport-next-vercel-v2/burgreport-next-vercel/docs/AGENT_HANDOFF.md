# Agent Handoff

## Product Direction

BurgReport is a Burgundy Grand Cru pricing intelligence product. Treat it like a compact pricing terminal for collectors, sommeliers, retailers, and investors.

The frontend must never fill missing market data with synthetic values.

## Current Frontend Mapping

Until the backend returns field-level status metadata, the frontend maps fields as follows:

- Backend-returned price, merchant, history, or comparable data: `live`
- Local Grand Cru facts and local/reference vintage context: `reference`
- Missing price, merchant, history, or comparable data: `unavailable`
- Explicitly enabled generated comparisons: `estimated`
- Homepage preview/sample search rows: `example`

## Search Terminal

The `/search` route is the flagship product surface. Its panels should remain visible even when data is unavailable:

- `MarketPricePanel`
- `SourceAvailabilityMatrix`
- `ClimatReferencePanel`
- `VintageContextPanel`
- `PriceHistoryPanel`
- `MerchantCoveragePanel`
- `ComparablesPanel`
- `MethodologyDisclosure`

Do not hide panels to make the page look cleaner. Missing data is part of the trust model.

## Backend Contract Target

See `docs/API_CONTRACT_LOCK_LIST.md` for the desired future `DataField<T>` response shape. The backend should become the source of truth for field-level statuses over time.

## Guardrails

Do not add auth, watchlists, cellar features, subscriptions, checkout, AI search, or backend architecture changes in frontend polish passes. Do not commit `.env.local` or real secrets.

# BurgReport Frontend Upgrade — Lovable Prompt Pack

Paste-ready prompts to upgrade the Lovable-managed React SPA (live at burgreport.com).
Field names are verified against the real `/api/search` response in `backend/routers/search.py`.

> **Dependency (already satisfied as of 2026-05-30):** the backend now returns
> `price.sources` (array of merchant URLs), `price.fetched_at`, and `price.merchant_count`.
> `price.drinking_window` and `price.merchant_count` are usually `null` — the OpenAI prompt
> deliberately does NOT infer them (see the drinking-window note at the bottom). `price.confidence`
> is ALWAYS the literal string `"unavailable"` — do NOT key UI off it; derive quality from
> `merchant_count` + min/max spread.

### Verified response contract

```jsonc
{
  "price": {
    "avg_usd": 2500, "min_usd": 425, "max_usd": 3500,   // number | null
    "merchant_count": null,            // integer | null (usually null today)
    "drinking_window": null,           // string  | null (usually null today)
    "sources": ["https://...", "..."], // string[] of URLs; may be []
    "confidence": "unavailable",       // ALWAYS this literal string
    "notes": "…",                      // string | null
    "fetched_at": "2026-05-30T00:32:33+00:00", // string | null (null on fresh fetch)
    "critic_score": null, "critic_name": null, "history": null
  },
  "meta": { "query": "...", "vintage": 2021, "response_ms": 842,
            "cache_hit": true, "data_source": "openai_web_search" },
  "climat": { "name": "...", "village": "...", "cote": "...", "is_monopole": false },
  "vintage": { "stars": 5, "label": "Exceptional", "note": "..." }
}
```

---

## 0. GLOBAL STYLE CONSTRAINT — prepend to EVERY prompt below

```
STYLE CONSTRAINT — apply to everything in this request:

BurgReport is a dark, dense, analytical "mission-control / terminal" interface for
Burgundy Grand Cru pricing — not a consumer wine shop. Aesthetic rules:
- Dark theme only. Near-black background (#0B0C0E / #101216), elevated panels at
  #16181D with 1px hairline borders (#23262D). No drop shadows; use borders + subtle
  background elevation for depth.
- Monospace font (JetBrains Mono / IBM Plex Mono / ui-monospace) for ALL numbers:
  prices, years, counts, percentages, response times, drinking windows. Body/label
  text uses a clean sans (Inter / system-ui).
- Restrained accent palette: deep claret/burgundy (#7B1E2B) for primary accents only;
  a muted gold (#C9A24B) used sparingly. Status colors: gray (#6B7280 neutral/default),
  amber (#D08A1E caution), blue (#3B82F6 verified). Avoid green for "live web data".
- Dense, data-grid spacing. Tight line-height, small uppercase tracked labels
  (11px, letter-spacing 0.08em, muted gray). Numbers larger and high-contrast.
- Copy is plain, honest, analytical. NO marketing hype. Forbidden phrasing:
  "autonomous web intelligence", "AI-powered", "real-time market data", "LIVE prices",
  anything implying the prices are authoritative or validated. We surface estimates.
- Tooltips/popovers: dark surface (#16181D), hairline border, monospace for values,
  ~12px text, appear on hover AND keyboard focus.
- Accessible: everything focusable; color is never the only signal (pair dot + text).
```

---

## 1. Remove Wine-Searcher branding → honest source line

```
[PREPEND GLOBAL STYLE CONSTRAINT]

Find and remove every instance of Wine-Searcher branding across the app: any
"Powered by Wine-Searcher", "Source: Wine-Searcher", logo, link, or attribution, in the
price card, footer, tooltips, and result metadata. Replace with a single honest
provenance line as a small muted caption directly under the price block:

  "Prices from web search across public merchant listings."

Do not name any specific merchant or data provider. Do not imply a licensing/data
partnership. For a longer info popover, use:
  "BurgReport estimates prices by searching public merchant listings on the open web.
   These are unvalidated estimates, not live quotes or offers to sell."

This is static copy — not bound to any API field. Remove any code that conditionally
rendered a Wine-Searcher attribution based on data_source.
```

---

## 2. Replace green "LIVE" badge → multi-tier Data Quality Badge

```
[PREPEND GLOBAL STYLE CONSTRAINT]

Remove the green "LIVE" badge entirely. Replace with a `DataQualityBadge` pill that
communicates how much we trust the price. Do NOT derive the tier from price.confidence
(it's always "unavailable"). Derive on the client from price.merchant_count and the
min/max spread.

Tier logic (in order):
1. SOMMELIER VERIFIED (blue #3B82F6) — only when a future field price.verified === true
   exists and is truthy. It does NOT exist yet; read defensively (default false) so it
   lights up automatically later. Label "Sommelier Verified".
2. LOW CONFIDENCE (amber #D08A1E) — when NOT verified AND any of:
     - price.merchant_count != null && price.merchant_count <= 2
     - min_usd and max_usd present AND (max_usd - min_usd)/max_usd > 0.6
   Label "Low Confidence".
3. WEB-PARSED (gray #6B7280) — DEFAULT whenever a price exists. Label "Web-Parsed".
If avg_usd, min_usd, max_usd all null → fourth muted state, gray outline, "No Price Data".

Visual: small pill, 1px border in tier color ~40% opacity, tier dot on the left,
uppercase tracked label in tier color. Tooltips (hover + focus):
- Web-Parsed: "Estimated from public merchant listings found via web search.
  Unvalidated — treat as a rough reference, not a quote."
- Low Confidence: "Few merchant listings or a wide price spread were found. This estimate
  is especially uncertain — verify with a merchant before relying on it."
- Sommelier Verified: "Manually reviewed and confirmed by a BurgReport sommelier."
- No Price Data: "No merchant listings were returned for this wine and vintage."

Expose the tier via a small pure helper getDataQualityTier(price) so it's testable.
Color is never the only signal — the text label always carries the meaning.
```

---

## 3. Drinking Window display

```
[PREPEND GLOBAL STYLE CONSTRAINT]

Add a `DrinkingWindow` component bound to price.drinking_window (string | null; free-form).
- null/empty → render nothing.
- present → small uppercase tracked label "DRINKING WINDOW" + the value in MONOSPACE,
  larger and high-contrast, e.g. 2028–2045. Normalize hyphen/dash variants to an en dash
  with no spaces. If not a clean range, display verbatim in monospace (don't crash).
Drink-readiness dot: parse first two 4-digit years. If both parse and the current year
(new Date().getFullYear()) is within [start,end] inclusive, show a subtle filled dot +
tiny label "Open" (muted green) or "Optimal" (muted gold) when mid-window. Before start →
"Hold"; after end → "Past window"; parse fail → just the verbatim string, no dot.
```

---

## 4. Sources dropdown / popover

```
[PREPEND GLOBAL STYLE CONSTRAINT]

Add a `SourcesPopover` bound to price.sources (array of URL strings; may be empty).
- empty/undefined → render nothing.
- has entries → small trigger chip with a list/link glyph reading "Sources (N)" in the
  muted label style. Click and keyboard Enter/Space open a dark popover (surface #16181D,
  hairline border) listing each source.
For each URL: display the CLEAN BASE DOMAIN only (strip protocol, www, path/query) via a
getBaseDomain(url) helper with try/catch around new URL(); fallback to raw truncated ~40
chars. Each row is an anchor opening the original URL in a NEW TAB
(target="_blank" rel="noopener noreferrer"). De-dupe by base domain, keep first full URL.
Rows: monospace domain, hover highlight, external-link glyph on the right.
Popover header (muted caption): "Merchant listings found via web search. Unvalidated."
Do NOT brand as a specific provider.
```

---

## 5. Price panel with unvalidated caveat + merchant count + freshness

```
[PREPEND GLOBAL STYLE CONSTRAINT]

Rebuild the price block as `PricePanel` bound to API price{} and meta{}.
Bindings: price.avg_usd/min_usd/max_usd (number|null), price.merchant_count (int|null),
price.fetched_at (string|null), meta.cache_hit (boolean).

Layout (dense, mission-control):
- Primary: AVG price, large, MONOSPACE, USD with thousands separators, no cents ($1,450).
  Label above: "AVG (EST.)".
- Secondary monospace row: "LOW $900" and "HIGH $1,800" from min/max. Omit cleanly if null.
- If avg null but min/max exist, show the range as primary. If all three null → empty state
  "No price estimate available" and skip caveat/merchant/freshness lines.

Mandatory caveat (always shown when any price present; muted amber #D08A1E, small,
non-dismissible): "Unvalidated estimate — verify with a merchant before purchase."

Merchant count line (muted caption, monospace): if merchant_count != null →
"Based on {n} merchant listing(s)." (correct singular/plural). If null, omit the line.

Freshness:
- If price.fetched_at present → "Cached • {relative time} ago" using fetched_at.
- Else fall back to meta.cache_hit: true → muted gray dot + "Cached" (tooltip "Served from
  cache, under 24h old."); false → muted dot + "Freshly fetched" (tooltip "Fetched live
  from web search for this request."). Never label "LIVE"; never green. This indicates
  fetch origin, not price validity.

Compose Components 2–4 + the static source line from Component 1 inside/adjacent to
PricePanel so the card reads as one coherent, honest unit.
```

---

### Suggested apply order in Lovable
1 (strip branding) → 2 (data-quality badge replaces LIVE) → 3 & 4 (drinking window, sources)
→ 5 (price panel composes them).

### Honest notes
- `drinking_window` and `merchant_count` are usually `null` today — the OpenAI prompt
  deliberately doesn't infer them. Components 2/3 render their empty states correctly.
  To actually populate drinking windows, make them the **sommelier's curated field**
  (the moat) rather than LLM-inferred — that's the right product call, not a plumbing fix.
- `sources` and `fetched_at` ARE populated now (verified live 2026-05-30).

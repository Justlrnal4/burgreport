# BurgReport Lovable Update — Ready-to-Paste Prompts

**Instructions:**
1. Open your Lovable project for burgreport.com
2. Start a new chat
3. Paste the prompts below **one at a time** (in order)
4. Review and publish after each major change

---

## Prompt 1: Global Style + Core Honesty Changes (Start Here)

```
Apply the following changes to the BurgReport app. Follow the style constraint exactly.

[STYLE CONSTRAINT — apply to everything]
BurgReport is a dark, dense, analytical "mission-control / terminal" interface for Burgundy Grand Cru pricing — not a consumer wine shop.

- Dark theme only. Background #0B0C0E / #101216, elevated panels at #16181D with 1px hairline borders (#23262D). No drop shadows.
- Monospace font (JetBrains Mono / IBM Plex Mono / ui-monospace) for ALL numbers: prices, years, counts, response times.
- Restrained accent palette: deep claret/burgundy (#7B1E2B) for primary, muted gold (#C9A24B) sparingly. Status: gray (#6B7280), amber (#D08A1E), blue (#3B82F6).
- Copy is plain, honest, analytical. NO marketing hype.
- Forbidden phrasing: "LIVE prices", "real-time market data", "Instant. Accurate.", "autonomous", anything implying authoritative validated data.
- We surface estimates from public web search. Always communicate uncertainty.

Now perform these two changes:

1. Remove Wine-Searcher branding completely
   - Delete every "Powered by Wine-Searcher", "Source: Wine-Searcher", logo, or attribution in price cards, footer, tooltips, and metadata.
   - Replace with this small muted caption directly under the price block:
     "Prices from web search across public merchant listings."

   For a longer explanation (info icon or popover):
   "BurgReport estimates prices by searching public merchant listings on the open web. These are unvalidated estimates, not live quotes or offers to sell."

2. Replace the green "LIVE" badge
   - Remove the green LIVE badge entirely.
   - Create a DataQualityBadge that shows:
     - "Web-Parsed" (default, gray) — when we have price data
     - "Low Confidence" (amber) — when merchant_count is low (≤2) or price spread is very wide (>60%)
     - "No Price Data" (muted) — when no price was returned
   - Add clear hover tooltips explaining each state honestly.
   - The text label must always carry the meaning.

Use the real API response fields: price.sources, price.fetched_at, price.merchant_count, price.notes.
```

---

## Prompt 2: Sources Popover (Run after Prompt 1 succeeds)

```
Add a SourcesPopover component bound to price.sources (array of strings).

- If sources is empty or null → render nothing.
- If sources exist → show a small trigger "Sources (N)" chip.
- Clicking it opens a clean dark popover listing each URL as a clickable link.
- Style: dark surface, hairline border, monospace for URLs if needed.
```

---

## Prompt 3: Final Polish & 34 Climats (Run last)

```
Final cleanup pass:

- Change every mention of "33 Grand Cru" or "33 climats" to "34 Grand Cru climats".
- Update any "Updated daily" or "Instant" language to be more accurate (e.g. "Refreshed regularly from public sources").
- Make sure the new honest source line and DataQualityBadge appear on all result cards.
- Remove any remaining hype language in features or how-it-works sections.
```

---

## Prompt 4: Bind the Data Quality Badge to the backend (run after Prompt 1)

```
The backend now returns a ready-made, honest quality assessment. STOP deriving the
DataQualityBadge from raw fields (merchant_count / spread) in the frontend — bind it
directly to the new object instead, so the UI and backend never disagree.

The search response now includes BOTH of these (identical object, use either):
  - response.truth.quality
  - response.price.data_quality

Shape:
  {
    "tier": "none" | "unsourced" | "single" | "limited" | "multiple",
    "score": 0 | 1 | 2 | 3,            // ordinal tier, NOT a percentage — never render as "/100" or a star rating
    "label": "Multiple sources",        // short badge text, use as-is
    "confidence": "unavailable" | "low" | "moderate",   // there is intentionally NO "high"
    "factors": { "sourceCount": 3, "spreadPct": 20.0, "isSinglePoint": false, "ageHours": 3.2, "isStale": false },
    "note": "Based on 3 merchant sources. Unvalidated estimate — verify with the merchant."
  }

Badge rules:
  - Render `label` as the badge text. Color by `confidence`:
      unavailable → muted/gray, low → amber, moderate → blue.
  - NEVER show a green/"authoritative" state. There is no high-confidence tier by design.
  - Show `note` in the tooltip/popover verbatim — it already explains the reasoning honestly.
  - If `factors.isStale` is true, also surface the age (e.g. "Cached ~10d ago").
  - tier "none" → render the existing "No price data" empty state, not a price.

Do not invent any wording about accuracy or validation beyond what `note` says.
```

## Prompt 5: "Defend this price" button (run after Prompt 1)

```
The search response now returns a ready-made, sourced price defense at
response.defense:
  {
    "headline": "Defending La Tâche 2019",
    "points": [ { "text": "...", "basis": "reference" | "vintage reference" | "web-sourced" }, ... ],
    "sources": ["https://...", ...],
    "caveat": "Prices are unvalidated estimates ...",
    "summary": "<one paragraph that already includes the caveat>"
  }

Add a "Defend this price" action to each result card:
  - A small outline button labelled "Defend this price".
  - Clicking opens a clean dark popover/sheet titled with `defense.headline`.
  - Render `defense.points` as a short bullet list. Tag each bullet's `basis`
    with a tiny muted chip ("reference" / "vintage reference" / "web-sourced") so
    the user can see where each claim comes from.
  - List `defense.sources` as clickable links under a "Sources" subheading; if
    empty, show "No merchant sources captured for this result."
  - Show `defense.caveat` as muted footnote text.
  - Add a "Copy" button that copies `defense.summary` to the clipboard verbatim.

Do not add, reword, or embellish any claim. Render the backend text as-is —
it is deliberately conservative and must not be made to sound more authoritative.
```

---

After completing these in Lovable, re-screenshot the real results and replace the old demo images in your portfolio.

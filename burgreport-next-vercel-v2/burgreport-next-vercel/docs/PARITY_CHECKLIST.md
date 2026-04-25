# Lovable vs Next.js Parity Checklist

## Landing

- [ ] Hero copy matches or improves Lovable.
- [ ] CTA opens `/search`.
- [ ] Ticker/sample queries open real search URLs.
- [ ] Mobile 375px and 390px work.
- [ ] No fake `LIVE` label appears.

## Search

- [ ] `/search` empty state renders.
- [ ] `/search?wine=Romanée-Conti&vintage=2019` renders.
- [ ] `/search?wine=Montrachet&vintage=2019` renders as white/Chardonnay.
- [ ] `/search?wine=NotARealWine` shows branded error.
- [ ] Autocomplete works with accents.
- [ ] Keyboard navigation works: down, up, Enter, Escape.
- [ ] Share copies `/search?...`, not the landing page.
- [ ] Missing backend fields are shown as missing, not invented.

## Guide pages

- [ ] `/grand-cru` lists all 33 climats.
- [ ] `/grand-cru/la-tache` renders.
- [ ] `/grand-cru/montrachet` renders.
- [ ] JSON-LD exists on detail pages.

## SEO

- [ ] `/sitemap.xml` includes static routes.
- [ ] `/robots.txt` disallows API routes.
- [ ] `/search?wine=...` is noindex.
- [ ] OG image loads without signed URL expiry.

## Performance/accessibility

- [ ] Lighthouse Performance ≥ 90.
- [ ] Lighthouse Accessibility ≥ 90.
- [ ] Lighthouse SEO ≥ 95.
- [ ] No console errors.
- [ ] Slow network does not white-screen.

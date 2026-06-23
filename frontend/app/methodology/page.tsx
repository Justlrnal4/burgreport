import type { Metadata } from 'next';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'How BurgReport labels estimated, reference, and unavailable Burgundy pricing context — and why prices are never presented as authoritative.',
  alternates: { canonical: '/methodology' }
};

const rows = [
  {
    status: 'estimated' as const,
    title: 'Web-sourced price estimates',
    body: 'Prices come from public merchant listings via web search (OpenAI / Tavily), not a licensed market feed. They are unvalidated estimates, labeled as such, with a confidence that is capped below "authoritative" — verify with the merchant before relying on a number.'
  },
  {
    status: 'live' as const,
    title: 'Licensed / first-party feed (reserved)',
    body: 'The "Live" status is reserved for a future licensed or first-party data feed. It is deliberately NOT used for web-sourced prices today — we do not license Wine-Searcher or Liv-ex, and we will not present a web estimate as an authoritative market figure.'
  },
  {
    status: 'reference' as const,
    title: 'Static reference context',
    body: 'Climat and vintage context from the local reference set, such as village, Côte, color, grape, size, and producer notes.'
  },
  {
    status: 'unavailable' as const,
    title: 'Missing source coverage',
    body: 'If the backend does not return price history, merchant coverage, comparables, or a price range, the frontend shows the field as unavailable.'
  },
  {
    status: 'example' as const,
    title: 'Illustrative previews',
    body: 'Used for homepage product previews and sample search links. Example content is not presented as market evidence.'
  }
];

export default function MethodologyPage() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-normal text-gold">Methodology</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-cream md:text-5xl">Trust labels come before price claims.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">
          The backend is the source of truth for market data. The frontend does not fabricate price data, merchant quotes, confidence scores, source counts, or price history. Missing coverage is shown directly rather than hidden.
        </p>

        <div className="mt-8 grid gap-3">
          {rows.map((row) => (
            <article key={row.status} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-cream">{row.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{row.body}</p>
                </div>
                <DataQualityBadge status={row.status} />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-gold/25 bg-ink p-5">
          <h2 className="text-lg font-semibold text-cream">How this improves over time</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            As coverage improves, unavailable fields can become estimated fields without changing the trust model — and if we ever add a licensed feed, that data earns the reserved &ldquo;Live&rdquo; status, walled off from the web-sourced estimates. BurgReport labels each field by source status before making any pricing claim.
          </p>
        </div>
      </div>
    </section>
  );
}

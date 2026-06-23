import { CopyButtons } from '@/components/search-terminal/CopyButtons';
import { formatUsd } from '@/lib/utils/format';
import type { SearchResult } from '@/types/burgreport';

// A quote-safe citation for writers/educators: every figure carries its status
// and provenance, nulls are stated as unavailable, and a backlink rides along —
// so a published citation is both safe to quote and a referral asset.
function buildCitation(result: SearchResult): string {
  const name = result.climat.name + (result.vintage ? ` ${result.vintage}` : '');
  const sourceCount = result.defense?.sources.length ?? 0;

  let priceClause: string;
  if (result.avgUsd !== null) {
    const range =
      result.minUsd !== null && result.maxUsd !== null && result.minUsd !== result.maxUsd
        ? ` (range ${formatUsd(result.minUsd)}–${formatUsd(result.maxUsd)})`
        : '';
    const conf = result.quality ? `, ${result.quality.confidence}-confidence` : '';
    priceClause = `web-sourced price estimate ~${formatUsd(result.avgUsd)}${range}${sourceCount ? `, from ${sourceCount} public merchant listing${sourceCount === 1 ? '' : 's'}` : ''}${conf}`;
  } else {
    priceClause = 'no web-sourced price available';
  }

  return (
    `${name} — ${priceClause}. ` +
    'Unvalidated estimate parsed from public listings, not a licensed market feed. ' +
    'Not available (not estimated): price history, merchant coverage, comparables, critic scores. ' +
    'Source: BurgReport (burgreport.com).'
  );
}

export function CitePanel({ result }: { result: SearchResult }) {
  const citation = buildCitation(result);

  return (
    <section className="rounded-2xl border border-line bg-ink p-4 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Cite this</p>
          <p className="mt-1 text-sm text-muted">Quote-safe — every figure carries its status and source.</p>
        </div>
        <CopyButtons items={[{ label: 'Copy citation', text: citation }]} />
      </div>
      <p className="mt-3 select-all rounded-xl border border-line bg-surface/70 p-3 text-sm leading-6 text-cream">{citation}</p>
    </section>
  );
}

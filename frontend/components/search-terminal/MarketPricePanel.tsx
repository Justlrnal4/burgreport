import { PanelShell } from '@/components/search-terminal/PanelShell';
import { UnavailableState } from '@/components/search-terminal/UnavailableState';
import { SourcingStrengthXray } from '@/components/search-terminal/SourcingStrengthXray';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import { ResultQualityBadge } from '@/components/data-quality/ResultQualityBadge';
import { formatUsd } from '@/lib/utils/format';
import type { SearchResult } from '@/types/burgreport';

export function MarketPricePanel({ result }: { result: SearchResult }) {
  const hasAverage = result.avgUsd !== null;
  // A web-sourced price is an ESTIMATE, never "live" (green). 'live' is reserved
  // for a future licensed/first-party feed — mirrors the backend truth model.
  const status = hasAverage ? 'estimated' : 'unavailable';

  return (
    <PanelShell title="Market price" eyebrow="Price context" status={status}>
      {hasAverage ? (
        <>
          <div className="font-mono text-5xl font-semibold tracking-normal text-gold">{formatUsd(result.avgUsd)}</div>
          {result.quality ? (
            <div className="mt-3">
              <ResultQualityBadge quality={result.quality} className="self-start" />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">Web-sourced estimate.</p>
          )}
          <SourcingStrengthXray result={result} />
        </>
      ) : (
        <UnavailableState detail="Average, low, and high prices are unavailable unless the backend returns credible values for this query." />
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <PriceMetric label="Average" value={formatUsd(result.avgUsd)} live={result.avgUsd !== null} />
        <PriceMetric label="Low" value={formatUsd(result.minUsd)} live={result.minUsd !== null} />
        <PriceMetric label="High" value={formatUsd(result.maxUsd)} live={result.maxUsd !== null} />
      </div>
      <div className="mt-4 rounded-xl border border-line bg-surface/70 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Currency</p>
          <DataQualityBadge status={hasAverage ? 'estimated' : 'unavailable'} compact />
        </div>
        <p className="mt-1 font-mono text-sm text-cream">{hasAverage ? 'USD' : 'Unavailable'}</p>
      </div>
    </PanelShell>
  );
}

function PriceMetric({ label, value, live }: { label: string; value: string; live: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface/70 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-normal text-hint">{label}</p>
        <DataQualityBadge status={live ? 'estimated' : 'unavailable'} compact />
      </div>
      <p className="mt-2 font-mono text-lg text-cream">{value}</p>
    </div>
  );
}

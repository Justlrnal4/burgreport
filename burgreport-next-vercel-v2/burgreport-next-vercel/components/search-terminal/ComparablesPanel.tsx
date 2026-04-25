import Link from 'next/link';
import { PanelShell } from '@/components/search-terminal/PanelShell';
import { UnavailableState } from '@/components/search-terminal/UnavailableState';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import { formatUsd } from '@/lib/utils/format';
import type { DataStatus, SearchResult } from '@/types/burgreport';

export function ComparablesPanel({ result }: { result: SearchResult }) {
  const status: DataStatus = result.comparables.length ? (result.comparables.every((item) => item.source === 'estimated') ? 'estimated' : 'live') : 'unavailable';

  return (
    <PanelShell title="Comparables" eyebrow="Relative context" status={status}>
      {result.comparables.length ? (
        <div className="grid gap-2">
          {result.comparables.map((comparable) => (
            <Link
              key={comparable.name}
              href={`/search?wine=${encodeURIComponent(comparable.name)}${result.vintage ? `&vintage=${result.vintage}` : ''}`}
              className="rounded-xl border border-line bg-surface/70 p-3 transition hover:border-gold/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-cream">{comparable.name}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{comparable.reason}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-gold">{formatUsd(comparable.avgUsd)}</p>
                  <DataQualityBadge status={comparable.source === 'estimated' ? 'estimated' : 'live'} compact className="mt-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <UnavailableState detail="Comparable wines are unavailable unless the backend returns them or estimated comparables are explicitly enabled and labeled." />
      )}
    </PanelShell>
  );
}

import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import { PanelShell } from '@/components/search-terminal/PanelShell';
import type { DataStatus, SearchResult } from '@/types/burgreport';

export function SourceAvailabilityMatrix({ result }: { result: SearchResult }) {
  const rows: Array<{ label: string; status: DataStatus; note: string }> = [
    { label: 'Price range', status: result.minUsd !== null || result.maxUsd !== null ? 'live' : 'unavailable', note: 'Backend price fields' },
    { label: 'Merchant coverage', status: result.merchants.length ? 'live' : 'unavailable', note: 'Backend source array' },
    { label: 'Price history', status: result.priceHistory.length >= 2 ? historyStatus(result) : 'unavailable', note: 'Backend history array' },
    { label: 'Comparables', status: comparablesStatus(result), note: 'Backend or explicit estimates' },
    { label: 'Vintage signal', status: result.vintageStars || result.vintageLabel || result.vintageNote ? 'reference' : 'unavailable', note: 'Vintage reference context' },
    { label: 'Climat reference', status: 'reference', note: 'Static Grand Cru data' }
  ];

  return (
    <PanelShell title="Source availability" eyebrow="Data matrix" status={rows.some((row) => row.status === 'live') ? 'live' : 'reference'}>
      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto] gap-3 bg-surface/60 px-3 py-3">
            <div>
              <p className="font-semibold text-cream">{row.label}</p>
              <p className="mt-1 text-xs text-muted">{row.note}</p>
            </div>
            <DataQualityBadge status={row.status} compact />
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function historyStatus(result: SearchResult): DataStatus {
  return result.priceHistory.every((point) => point.source === 'estimated') ? 'estimated' : 'live';
}

function comparablesStatus(result: SearchResult): DataStatus {
  if (!result.comparables.length) return 'unavailable';
  return result.comparables.every((item) => item.source === 'estimated') ? 'estimated' : 'live';
}

import { PanelShell } from '@/components/search-terminal/PanelShell';
import { UnavailableState } from '@/components/search-terminal/UnavailableState';
import { formatUsd } from '@/lib/utils/format';
import type { DataStatus, SearchResult } from '@/types/burgreport';

export function PriceHistoryPanel({ result }: { result: SearchResult }) {
  const points = result.priceHistory;
  const status: DataStatus = points.length >= 2 ? (points.every((point) => point.source === 'estimated') ? 'estimated' : 'live') : 'unavailable';

  return (
    <PanelShell title="Price history" eyebrow="Historical series" status={status}>
      {points.length >= 2 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-normal text-hint">
                  <th className="border-b border-line px-3 py-2 font-normal">Label</th>
                  <th className="border-b border-line px-3 py-2 font-normal">Year</th>
                  <th className="border-b border-line px-3 py-2 font-normal">Average</th>
                  <th className="border-b border-line px-3 py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={`${point.label}-${point.year}`}>
                    <td className="border-b border-line px-3 py-2 text-cream">{point.label}</td>
                    <td className="border-b border-line px-3 py-2 font-mono text-gold">{point.year}</td>
                    <td className="border-b border-line px-3 py-2 font-mono text-cream">{formatUsd(point.avgUsd)}</td>
                    <td className="border-b border-line px-3 py-2 font-mono text-muted">{point.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <UnavailableState detail="Price history is unavailable unless the backend returns historical price points." />
      )}
    </PanelShell>
  );
}

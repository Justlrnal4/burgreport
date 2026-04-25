import { DataQualityBadge, type DataQualityStatus } from '@/components/data-quality/DataQualityBadge';

const ITEMS: Array<{ status: DataQualityStatus; text: string }> = [
  { status: 'live', text: 'returned by backend' },
  { status: 'estimated', text: 'calculated or inferred and labeled' },
  { status: 'reference', text: 'static climat/vintage context' },
  { status: 'unavailable', text: 'not enough source data' },
  { status: 'example', text: 'illustrative preview only' }
];

export function DataQualityLegend() {
  return (
    <section aria-labelledby="data-quality-legend" className="rounded-2xl border border-line bg-surface/80 p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p id="data-quality-legend" className="font-mono text-xs uppercase tracking-normal text-gold">Data quality legend</p>
          <p className="mt-1 text-sm text-muted">BurgReport separates source status before you act on price.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map((item) => (
            <div key={item.status} className="rounded-xl border border-line bg-ink px-3 py-2">
              <DataQualityBadge status={item.status} compact />
              <p className="mt-1 text-xs leading-5 text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

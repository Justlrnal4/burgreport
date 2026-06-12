import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import type { DataStatus } from '@/types/burgreport';

const ITEMS: Array<{ status: DataStatus; label: string; text: string }> = [
  { status: 'live', label: 'Live', text: 'returned by backend' },
  { status: 'estimated', label: 'Estimated', text: 'calculated and labeled' },
  { status: 'reference', label: 'Reference', text: 'static context' },
  { status: 'unavailable', label: 'Unavailable', text: 'not enough data' },
  { status: 'example', label: 'Example', text: 'illustrative only' }
];

export function DataQualityLegend() {
  return (
    <section aria-labelledby="data-quality-legend" className="rounded-xl border border-line bg-surface/80 p-3 shadow-card">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p id="data-quality-legend" className="font-mono text-xs uppercase tracking-normal text-gold">Data quality legend</p>
          <p className="mt-1 text-xs text-muted">Source status stays visible before price claims.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ITEMS.map((item) => (
            <div key={item.status} className="inline-flex items-center gap-2 rounded-full border border-line bg-ink px-2.5 py-1.5">
              <DataQualityBadge status={item.status} compact />
              <span className="text-xs text-muted"><span className="sr-only">{item.label}: </span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

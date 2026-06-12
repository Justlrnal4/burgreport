import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';

export function UnavailableState({ title = 'Unavailable', detail }: { title?: string; detail: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-cream">{title}</p>
        <DataQualityBadge status="unavailable" compact />
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

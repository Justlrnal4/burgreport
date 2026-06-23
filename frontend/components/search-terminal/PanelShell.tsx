import type { ReactNode } from 'react';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import type { DataStatus } from '@/types/burgreport';

export function PanelShell({ title, eyebrow, status, children }: { title: string; eyebrow?: string; status: DataStatus; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-ink p-4 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {eyebrow && <p className="font-mono text-[10px] uppercase tracking-normal text-hint">{eyebrow}</p>}
          <h2 className="mt-1 text-lg font-semibold text-cream">{title}</h2>
        </div>
        <DataQualityBadge status={status} compact />
      </div>
      {children}
    </section>
  );
}

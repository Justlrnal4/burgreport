import type { Metadata } from 'next';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import { GrandCruTable } from '@/components/grand-cru/GrandCruTable';
import { GRAND_CRUS } from '@/lib/data/grand-crus';

export const metadata: Metadata = {
  title: 'Grand Cru Guide',
  description: 'Browse all 33 Burgundy Grand Cru climats in the BurgReport reference guide.',
  alternates: { canonical: '/grand-cru' }
};

export default function GrandCruIndexPage() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs uppercase tracking-normal text-gold">Grand Cru Guide</p>
              <DataQualityBadge status="reference" compact />
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-cream md:text-5xl">All 33 Grand Cru climats.</h1>
          </div>
          <p className="text-sm leading-6 text-muted">
            A filterable reference database for climat facts: name, village, Côte, color, grape, size, monopole status, and search actions.
          </p>
        </div>

        <GrandCruTable wines={GRAND_CRUS} />
      </div>
    </section>
  );
}

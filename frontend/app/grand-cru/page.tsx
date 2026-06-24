import type { Metadata } from 'next';
import { GrandCruTable } from '@/components/grand-cru/GrandCruTable';
import { PageHeader } from '@/components/site/page-header';
import { Reveal } from '@/components/motion/reveal';
import { GRAND_CRUS } from '@/lib/data/grand-crus';

export const metadata: Metadata = {
  title: 'Grand Cru Guide',
  description: 'Browse all 34 Burgundy Grand Cru climats in the BurgReport reference guide.',
  alternates: { canonical: '/grand-cru' }
};

export default function GrandCruIndexPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Grand Cru Guide"
          title="All 34 Grand Cru climats."
          aside="A filterable reference for every climat — name, village, Côte, color, grape, size, and monopole status — each a one-tap jump into a live price check."
        />
        <Reveal delay={80}>
          <GrandCruTable wines={GRAND_CRUS} />
        </Reveal>
      </div>
    </section>
  );
}

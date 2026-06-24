import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/page-header';
import { Reveal } from '@/components/motion/reveal';
import { VINTAGES } from '@/lib/data/vintages';

export const metadata: Metadata = {
  title: 'Burgundy Vintage Guide',
  description: 'Starter vintage guide for BurgReport. Final notes should be verified against the production data source.',
  alternates: { canonical: '/vintages' }
};

export default function VintagesPage() {
  const years = Array.from(new Set(VINTAGES.map((vintage) => vintage.year))).sort((a, b) => b - a);

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Vintage Guide"
          title="Côte-specific vintage context."
          description="Côte de Nuits and Côte de Beaune are kept separate, so white Burgundy is never forced into red-Burgundy assumptions. Reference context — verified before any price claim."
        />

        <div className="mt-12 grid gap-4">
          {years.map((year, idx) => {
            const rows = VINTAGES.filter((vintage) => vintage.year === year);
            return (
              <Reveal key={year} delay={Math.min(idx * 40, 200)}>
                <article className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card md:grid md:grid-cols-[160px_1fr] md:gap-6">
                  <div className="font-mono text-5xl font-semibold text-gold">{year}</div>
                  <div className="mt-5 grid gap-4 md:mt-0 md:grid-cols-2">
                    {rows.map((row) => (
                      <div key={`${row.year}-${row.cote}`} className="rounded-2xl border border-line bg-ink p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="font-semibold text-cream">{row.cote}</h2>
                          <span className="text-gold">{'★'.repeat(row.stars)}{'☆'.repeat(5 - row.stars)}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-gold">{row.label}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{row.note}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

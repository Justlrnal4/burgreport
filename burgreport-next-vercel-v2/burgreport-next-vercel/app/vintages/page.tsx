import type { Metadata } from 'next';
import { VINTAGES } from '@/lib/data/vintages';

export const metadata: Metadata = {
  title: 'Burgundy Vintage Guide',
  description: 'Starter vintage guide for BurgReport. Final notes should be verified against the production data source.',
  alternates: { canonical: '/vintages' }
};

export default function VintagesPage() {
  const years = Array.from(new Set(VINTAGES.map((vintage) => vintage.year))).sort((a, b) => b - a);

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-normal text-gold">Vintage Guide</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-cream md:text-6xl">Côte-specific vintage context.</h1>
          <p className="mt-5 text-sm leading-6 text-muted">
            This starter page separates Côte de Nuits and Côte de Beaune so white Burgundy is not forced into red Burgundy assumptions. Verify final vintage notes before production publishing.
          </p>
        </div>

        <div className="mt-10 grid gap-4">
          {years.map((year) => {
            const rows = VINTAGES.filter((vintage) => vintage.year === year);
            return (
              <article key={year} className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-card md:grid md:grid-cols-[160px_1fr] md:gap-6">
                <div className="font-mono text-5xl font-semibold text-gold">{year}</div>
                <div className="mt-5 grid gap-4 md:mt-0 md:grid-cols-2">
                  {rows.map((row) => (
                    <div key={`${row.year}-${row.cote}`} className="rounded-2xl border border-line bg-ink p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-cream">{row.cote}</h2>
                        <span className="text-gold">{'★'.repeat(row.stars)}{'☆'.repeat(5 - row.stars)}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-gold">{row.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{row.note}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

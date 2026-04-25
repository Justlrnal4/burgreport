import type { Metadata } from 'next';
import { SearchEmptyState } from '@/components/search/search-empty-state';
import { DataQualityLegend } from '@/components/data-quality/DataQualityLegend';
import { SearchCommandBar } from '@/components/search-terminal/SearchCommandBar';
import { SearchTerminal } from '@/components/search-terminal/SearchTerminal';
import { GRAND_CRUS } from '@/lib/data/grand-crus';
import { searchWine } from '@/lib/api/burgreport';

interface SearchPageProps {
  searchParams: Promise<{ wine?: string; vintage?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const wine = params.wine?.trim();
  if (!wine) {
    return {
      title: 'Search Grand Cru Burgundy',
      description: 'Search all 33 Burgundy Grand Cru climats with transparent pricing context and data-quality status.',
      alternates: { canonical: '/search' },
      robots: { index: true, follow: true }
    };
  }

  const vintageParam = params.vintage?.trim() || '';
  const vintage = /^\d{4}$/.test(vintageParam) ? ` ${vintageParam}` : '';
  return {
    title: `${wine}${vintage} — Price & Context`,
    description: `Pricing context for ${wine}${vintage}. Backend-returned values, reference context, and unavailable fields are labeled.`,
    alternates: { canonical: '/search' },
    robots: { index: false, follow: true }
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const wine = params.wine?.trim() || '';
  const vintageParam = params.vintage?.trim() || '';
  const vintage = /^\d{4}$/.test(vintageParam) ? vintageParam : '';
  const payload = wine ? await searchWine(wine, vintage) : null;

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-normal text-gold">Pricing terminal</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-cream md:text-5xl">Grand Cru pricing intelligence.</h1>
          </div>
          <p className="text-sm leading-6 text-muted lg:max-w-2xl">
            Search params drive the result URL. Backend-returned values, static reference context, estimated fields, and unavailable fields stay visibly separated.
          </p>
        </div>

        <div className="mt-6">
          <SearchCommandBar wines={GRAND_CRUS} initialWine={wine} initialVintage={vintage} canShare={Boolean(payload?.result)} />
        </div>

        <div className="mt-4">
          <DataQualityLegend />
        </div>

        <div className="mt-5">
          {!wine && <SearchEmptyState />}
          {payload?.error && (
            <div className="mb-5 rounded-2xl border border-danger/35 bg-danger/10 p-5 text-sm text-danger">
              <p className="font-semibold">{payload.error.status === 'backend-error' ? 'Backend unavailable' : payload.error.message}</p>
              <p className="mt-1 text-danger/80">
                {payload.error.status === 'backend-error' ? 'Reference data may still be available. Try again in a moment.' : payload.error.detail}
              </p>
            </div>
          )}
          {payload?.result && <SearchTerminal result={payload.result} />}
        </div>
      </div>
    </section>
  );
}

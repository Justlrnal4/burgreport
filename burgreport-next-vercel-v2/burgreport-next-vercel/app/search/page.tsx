import type { Metadata } from 'next';
import { HeroSearch } from '@/components/search/hero-search';
import { SearchEmptyState } from '@/components/search/search-empty-state';
import { ResultCard } from '@/components/result/result-card';
import { DataQualityLegend } from '@/components/data-quality/DataQualityLegend';
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
  const vintage = params.vintage?.trim() || '';
  const payload = wine ? await searchWine(wine, vintage) : null;

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-normal text-gold">Pricing terminal</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-cream md:text-5xl">Grand Cru pricing intelligence.</h1>
          </div>
          <p className="text-sm leading-6 text-muted lg:max-w-2xl">
            Search params drive the result URL. Backend-returned values, static reference context, estimated fields, and unavailable fields stay visibly separated.
          </p>
        </div>

        <div className="mt-7">
          <HeroSearch wines={GRAND_CRUS} initialWine={wine} initialVintage={vintage} />
        </div>

        <div className="mt-5">
          <DataQualityLegend />
        </div>

        <div className="mt-7">
          {!wine && <SearchEmptyState />}
          {payload?.error && (
            <div className="mb-6 rounded-3xl border border-danger/35 bg-danger/10 p-5 text-sm text-danger">
              <p className="font-semibold">{payload.error.message}</p>
              {payload.error.detail && <p className="mt-1 text-danger/80">{payload.error.detail}</p>}
            </div>
          )}
          {payload?.result && <ResultCard result={payload.result} />}
        </div>
      </div>
    </section>
  );
}

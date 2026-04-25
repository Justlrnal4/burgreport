import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GRAND_CRUS, getGrandCruBySlug, relatedGrandCrus } from '@/lib/data/grand-crus';
import { absoluteUrl } from '@/lib/utils/seo';

interface GrandCruPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GRAND_CRUS.map((wine) => ({ slug: wine.slug }));
}

export async function generateMetadata({ params }: GrandCruPageProps): Promise<Metadata> {
  const { slug } = await params;
  const wine = getGrandCruBySlug(slug);
  if (!wine) return {};

  return {
    title: `${wine.name} — Grand Cru Guide`,
    description: `${wine.name} pricing context, village, Côte, grape, and key producer reference for BurgReport.`,
    alternates: { canonical: `/grand-cru/${wine.slug}` },
    openGraph: {
      title: `${wine.name} — BurgReport Grand Cru Guide`,
      description: wine.summary,
      url: absoluteUrl(`/grand-cru/${wine.slug}`)
    }
  };
}

export default async function GrandCruPage({ params }: GrandCruPageProps) {
  const { slug } = await params;
  const wine = getGrandCruBySlug(slug);
  if (!wine) notFound();
  const related = relatedGrandCrus(wine, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: wine.name,
    category: 'Wine',
    description: wine.summary,
    brand: { '@type': 'Brand', name: wine.keyProducers[0] || wine.name },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Village', value: wine.village },
      { '@type': 'PropertyValue', name: 'Côte', value: wine.cote },
      { '@type': 'PropertyValue', name: 'Color', value: wine.color },
      { '@type': 'PropertyValue', name: 'Grape', value: wine.grape },
      { '@type': 'PropertyValue', name: 'Size hectares', value: String(wine.sizeHa) }
    ]
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-line bg-surface p-6 shadow-card md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Grand Cru Guide</p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-cream md:text-7xl">{wine.name}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{wine.summary}</p>
            </div>
            <Link href={`/search?wine=${encodeURIComponent(wine.name)}`} className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-cream">
              Search {wine.name}
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <Fact label="Village" value={wine.village} />
            <Fact label="Côte" value={wine.cote} />
            <Fact label="Wine" value={`${wine.color} · ${wine.grape}`} />
            <Fact label="Size" value={`${wine.sizeHa} ha`} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[2rem] border border-line bg-surface p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Producer reference</p>
            <div className="mt-5 grid gap-3">
              {wine.keyProducers.map((producer) => (
                <div key={producer} className="rounded-2xl border border-line bg-ink px-4 py-3 text-sm text-cream">
                  {producer}
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-hint">Producer lists are reference context, not proof of merchant availability.</p>
          </section>

          <section className="rounded-[2rem] border border-line bg-surface p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Related climats</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((item) => (
                <Link key={item.slug} href={`/grand-cru/${item.slug}`} className="rounded-2xl border border-line bg-ink p-4 transition hover:border-gold/50">
                  <p className="font-semibold text-cream">{item.name}</p>
                  <p className="mt-1 text-xs text-hint">{item.village} · {item.color}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line bg-ink p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-hint">{label}</p>
      <p className="mt-3 text-lg font-semibold text-cream">{value}</p>
    </div>
  );
}

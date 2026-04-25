import Link from 'next/link';
import { BurgReportHeroLockup } from '@/components/brand/burg-report-logo';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import { DataQualityLegend } from '@/components/data-quality/DataQualityLegend';
import { HeroSearch } from '@/components/search/hero-search';
import { GRAND_CRUS } from '@/lib/data/grand-crus';

const sampleChecks = [
  { name: 'La Tâche', vintage: '2019' },
  { name: 'Romanée-Conti', vintage: '2018' },
  { name: 'Montrachet', vintage: '2014' },
  { name: 'Clos de la Roche', vintage: '2016' }
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pb-10 lg:pt-10">
      <div className="absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-wine/10 via-elevated/10 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <BurgReportHeroLockup />
            <div className="mt-6">
              <h1 className="max-w-4xl text-balance text-4xl font-black leading-none tracking-normal text-cream sm:text-5xl lg:text-6xl">
                Know what every <span className="text-gold">Grand Cru</span> is worth.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
                Search Burgundy&apos;s 33 Grand Cru climats and review pricing context, vintage signal, and data-quality status before you buy, sell, or benchmark a bottle.
              </p>
            </div>

            <div className="mt-6 max-w-4xl">
              <HeroSearch wines={GRAND_CRUS} variant="hero" />
              <div className="mt-4 flex flex-wrap gap-2">
                {sampleChecks.map((item) => (
                  <Link
                    key={`${item.name}-${item.vintage}`}
                    href={`/search?wine=${encodeURIComponent(item.name)}&vintage=${item.vintage}`}
                    className="rounded-full border border-line bg-surface px-3 py-2 text-sm text-muted transition hover:border-gold/60 hover:text-gold"
                  >
                    <span>{item.name}</span> <span className="font-mono text-gold">{item.vintage}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <ExamplePreviewCard />
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <DataQualityLegend />
          <ExampleSearchTable />
        </div>
      </div>
    </section>
  );
}

function ExamplePreviewCard() {
  return (
    <aside className="rounded-2xl border border-line bg-surface/90 p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <DataQualityBadge status="example" />
          <h2 className="mt-4 text-2xl font-semibold text-cream">La Tâche</h2>
          <p className="mt-1 font-mono text-sm text-gold">2019</p>
        </div>
        <Link href="/search?wine=La%20T%C3%A2che&vintage=2019" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-cream transition hover:border-gold/60 hover:text-gold">
          Open example search
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <PreviewMetric label="Price status" value="Unavailable" status="unavailable" />
        <PreviewMetric label="Vintage signal" value="Reference" status="reference" />
        <PreviewMetric label="Merchant coverage" value="Unavailable" status="unavailable" />
        <PreviewMetric label="Context type" value="Example" status="example" />
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">
        This preview shows the result structure. Live values appear only when returned by the backend.
      </p>
    </aside>
  );
}

function PreviewMetric({ label, value, status }: { label: string; value: string; status: 'reference' | 'unavailable' | 'example' }) {
  return (
    <div className="rounded-xl border border-line bg-ink p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-normal text-hint">{label}</p>
        <DataQualityBadge status={status} compact />
      </div>
      <p className="mt-3 font-mono text-sm text-cream">{value}</p>
    </div>
  );
}

function ExampleSearchTable() {
  return (
    <section className="rounded-2xl border border-line bg-surface/80 p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-normal text-gold">Example market checks</p>
          <p className="mt-1 text-sm text-muted">Illustrative search links, not live market claims.</p>
        </div>
        <DataQualityBadge status="example" compact />
      </div>
      <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {sampleChecks.map((item) => (
          <Link
            key={`${item.name}-row`}
            href={`/search?wine=${encodeURIComponent(item.name)}&vintage=${item.vintage}`}
            className="grid grid-cols-[1fr_74px_110px] gap-3 bg-ink px-3 py-3 text-sm transition hover:bg-elevated"
          >
            <span className="font-semibold text-cream">{item.name}</span>
            <span className="font-mono text-gold">{item.vintage}</span>
            <span className="text-right text-muted">Example search</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

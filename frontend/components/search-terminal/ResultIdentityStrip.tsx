import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import { SaveButton } from '@/components/search-terminal/SaveButton';
import type { SearchResult } from '@/types/burgreport';

export function ResultIdentityStrip({ result }: { result: SearchResult }) {
  const priceStatus = result.avgUsd === null ? 'unavailable' : 'estimated';

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <DataQualityBadge status="reference" />
            <DataQualityBadge status={priceStatus} />
            {result.climat.isMonopole && <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-normal text-gold">Monopole</span>}
            <SaveButton slug={result.climat.slug} name={result.climat.name} vintage={result.vintage} />
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-cream md:text-5xl">{result.climat.name}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {result.vintage && <span className="font-mono text-gold">{result.vintage}</span>} {result.vintage ? '· ' : ''}
            {result.climat.village} · {result.climat.cote} · {result.climat.color} · {result.climat.grape}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[440px]">
          <IdentityFact label="Côte" value={result.climat.cote} />
          <IdentityFact label="Wine" value={result.climat.color} />
          <IdentityFact label="Grape" value={result.climat.grape} />
          <IdentityFact label="Size" value={`${result.climat.sizeHa || 0} ha`} mono />
        </div>
      </div>
    </section>
  );
}

function IdentityFact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-ink p-3">
      <p className="font-mono text-[10px] uppercase tracking-normal text-hint">{label}</p>
      <p className={`mt-1 text-sm text-cream ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

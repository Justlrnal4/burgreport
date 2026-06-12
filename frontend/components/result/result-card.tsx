'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { SearchResult } from '@/types/burgreport';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import { DataSourceBadge } from '@/components/result/data-source-badge';
import { PriceTrendChart } from '@/components/result/price-trend-chart';
import { formatUsd } from '@/lib/utils/format';

export function ResultCard({ result }: { result: SearchResult }) {
  const [priceToCheck, setPriceToCheck] = useState('');
  const [copied, setCopied] = useState(false);

  const fairness = useMemo(() => {
    const entered = Number(priceToCheck);
    if (!Number.isFinite(entered) || entered <= 0 || !result.avgUsd) return null;
    const delta = ((entered - result.avgUsd) / result.avgUsd) * 100;
    if (delta <= -25) return { label: 'Great deal', tone: 'text-success', detail: `${Math.abs(delta).toFixed(0)}% below average` };
    if (delta <= -10) return { label: 'Good value', tone: 'text-success', detail: `${Math.abs(delta).toFixed(0)}% below average` };
    if (delta <= 10) return { label: 'Fair value', tone: 'text-gold', detail: `${Math.abs(delta).toFixed(0)}% from average` };
    return { label: 'Above market', tone: 'text-danger', detail: `${Math.abs(delta).toFixed(0)}% above average` };
  }, [priceToCheck, result.avgUsd]);

  async function share() {
    const params = new URLSearchParams({ wine: result.climat.name });
    if (result.vintage) params.set('vintage', result.vintage);
    const href = `${window.location.origin}/search?${params.toString()}`;
    await navigator.clipboard.writeText(href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <header className="border-b border-line bg-ink px-5 py-4 sm:px-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <DataSourceBadge source={result.dataSource} />
              <DataQualityBadge status="reference" />
              {result.climat.isMonopole && <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-normal text-gold">Monopole</span>}
              {result.cacheHit !== null && <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-normal text-hint">{result.cacheHit ? 'Cached' : 'Fetched'}</span>}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-cream md:text-5xl">{result.climat.name}</h1>
            <p className="mt-2 text-sm text-muted">{result.climat.village} · {result.climat.cote} · {result.climat.color} {result.climat.grape}</p>
          </div>
          <button type="button" onClick={share} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-cream transition hover:border-gold/60 hover:text-gold">
            {copied ? 'Copied' : 'Share result'}
          </button>
        </div>
      </header>

      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-line bg-ink p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-normal text-hint">Average retail</p>
            <DataQualityBadge status={result.avgUsd === null ? 'unavailable' : 'live'} compact />
          </div>
          <div className="mt-4 font-mono text-4xl font-semibold tracking-normal text-gold md:text-5xl">{formatUsd(result.avgUsd)}</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="Low" value={formatUsd(result.minUsd)} status={result.minUsd === null ? 'unavailable' : 'live'} />
            <Metric label="High" value={formatUsd(result.maxUsd)} status={result.maxUsd === null ? 'unavailable' : 'live'} />
            <Metric label="Score" value={result.criticScore ? `${result.criticScore}/100` : 'Unavailable'} status={result.criticScore ? 'live' : 'unavailable'} />
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">{result.description}</p>
        </section>

        <section className="rounded-2xl border border-line bg-ink p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-normal text-hint">Vintage context</p>
            <DataQualityBadge status={result.vintageStars || result.vintageLabel || result.vintageNote ? 'reference' : 'unavailable'} compact />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="font-mono text-4xl text-gold">{result.vintage || '—'}</span>
            <span className="text-xl">{'★'.repeat(result.vintageStars || 0)}{'☆'.repeat(Math.max(0, 5 - (result.vintageStars || 0)))}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-cream">{result.vintageLabel || 'Vintage data pending'}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{result.vintageNote || 'Vintage note is not available from the backend yet.'}</p>
          <p className="mt-4 text-xs text-hint">Drinking window: {result.drinkingWindow || 'Not returned by backend'}</p>
        </section>
      </div>

      <div className="grid gap-5 px-5 pb-5 sm:px-7 sm:pb-7 lg:grid-cols-[1.1fr_0.9fr]">
        <PriceTrendChart points={result.priceHistory} />

        <section className="rounded-2xl border border-line bg-ink p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-normal text-gold">Fairness check</p>
            <DataQualityBadge status={result.avgUsd === null ? 'unavailable' : 'live'} compact />
          </div>
          <label htmlFor="price-check" className="mt-4 block text-sm text-muted">Enter an offered bottle price.</label>
          <div className="mt-3 flex gap-3">
            <input
              id="price-check"
              inputMode="numeric"
              value={priceToCheck}
              onChange={(event) => setPriceToCheck(event.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 3840"
              className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 font-mono text-cream placeholder:text-hint focus:border-gold"
            />
          </div>
          {fairness ? (
            <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
              <p className={`font-semibold ${fairness.tone}`}>{fairness.label}</p>
              <p className="mt-1 text-sm text-muted">{fairness.detail}</p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">Fairness check needs a backend-returned average price and an entered offer.</p>
          )}
        </section>
      </div>

      <div className="grid gap-5 px-5 pb-5 sm:px-7 sm:pb-7 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-ink p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-normal text-gold">Merchant quotes</p>
            <DataQualityBadge status={result.merchants.length ? 'live' : 'unavailable'} compact />
          </div>
          {result.merchants.length ? (
            <div className="mt-4 grid gap-3">
              {result.merchants.map((merchant) => (
                <div key={merchant.merchant} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 text-sm">
                  <span className="text-cream">{merchant.merchant}</span>
                  <span className="font-mono text-gold">{formatUsd(merchant.priceUsd)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">Merchant/source coverage is unavailable unless returned by the backend.</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-ink p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-normal text-gold">Comparables</p>
            <DataQualityBadge status={result.comparables.length ? (result.comparables.every((item) => item.source === 'estimated') ? 'estimated' : 'live') : 'unavailable'} compact />
          </div>
          {result.comparables.length ? (
            <div className="mt-4 grid gap-3">
              {result.comparables.map((comparable) => (
                <Link key={comparable.name} href={`/search?wine=${encodeURIComponent(comparable.name)}${result.vintage ? `&vintage=${result.vintage}` : ''}`} className="rounded-2xl border border-line bg-surface p-3 transition hover:border-gold/50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-cream">{comparable.name}</span>
                    <span className="font-mono text-sm text-gold">{formatUsd(comparable.avgUsd)}</span>
                  </div>
                  <p className="mt-1 text-xs text-hint">{comparable.reason} · {comparable.source}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">Comparable wines are unavailable unless returned by the backend or explicitly enabled as estimated data.</p>
          )}
        </section>
      </div>

      {result.sourceNotes.length > 0 && (
        <footer className="border-t border-line bg-ink px-5 py-5 sm:px-7">
          <p className="font-mono text-xs uppercase tracking-normal text-hint">Data quality notes</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {result.sourceNotes.map((note) => <li key={note}>• {note}</li>)}
          </ul>
        </footer>
      )}
    </article>
  );
}

function Metric({ label, value, status }: { label: string; value: string; status: 'live' | 'unavailable' }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-normal text-hint">{label}</p>
        <DataQualityBadge status={status} compact />
      </div>
      <p className="mt-2 font-mono text-lg text-cream">{value}</p>
    </div>
  );
}

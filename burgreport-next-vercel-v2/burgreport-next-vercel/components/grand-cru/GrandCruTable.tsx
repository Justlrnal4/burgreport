'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import type { Cote, GrandCru, WineColor } from '@/types/burgreport';

type CoteFilter = 'All' | Cote;
type ColorFilter = 'All' | WineColor;
type MonopoleFilter = 'All' | 'Monopole';

export function GrandCruTable({ wines }: { wines: GrandCru[] }) {
  const [query, setQuery] = useState('');
  const [cote, setCote] = useState<CoteFilter>('All');
  const [color, setColor] = useState<ColorFilter>('All');
  const [monopole, setMonopole] = useState<MonopoleFilter>('All');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return wines.filter((wine) => {
      const haystack = `${wine.name} ${wine.village} ${wine.cote} ${wine.color} ${wine.grape}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return (
        (!normalized || haystack.includes(normalized)) &&
        (cote === 'All' || wine.cote === cote) &&
        (color === 'All' || wine.color === color) &&
        (monopole === 'All' || wine.isMonopole)
      );
    });
  }, [color, cote, monopole, query, wines]);

  return (
    <section className="mt-8 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
        <label className="sr-only" htmlFor="grand-cru-filter">Search Grand Cru guide</label>
        <input
          id="grand-cru-filter"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, village, Côte..."
          className="h-11 rounded-xl border border-line bg-ink px-4 text-sm text-cream placeholder:text-hint focus:border-gold"
        />
        <FilterSelect label="Côte" value={cote} onChange={(value) => setCote(value as CoteFilter)} options={['All', 'Côte de Nuits', 'Côte de Beaune']} />
        <FilterSelect label="Color" value={color} onChange={(value) => setColor(value as ColorFilter)} options={['All', 'Red', 'White']} />
        <FilterSelect label="Monopole" value={monopole} onChange={(value) => setMonopole(value as MonopoleFilter)} options={['All', 'Monopole']} />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-hint">
              {['Name', 'Village', 'Côte', 'Wine', 'Size', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="border-b border-line px-3 py-3 font-mono font-normal tracking-normal">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((wine) => (
              <tr key={wine.slug} className="group">
                <td className="border-b border-line px-3 py-3 font-semibold text-cream">{wine.name}</td>
                <td className="border-b border-line px-3 py-3 text-muted">{wine.village}</td>
                <td className="border-b border-line px-3 py-3 text-muted">{wine.cote}</td>
                <td className="border-b border-line px-3 py-3 text-muted">{wine.color} · {wine.grape}</td>
                <td className="border-b border-line px-3 py-3 font-mono text-gold">{wine.sizeHa} ha</td>
                <td className="border-b border-line px-3 py-3">
                  <div className="flex items-center gap-2">
                    <DataQualityBadge status="reference" compact />
                    {wine.isMonopole && <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-normal text-gold">Monopole</span>}
                  </div>
                </td>
                <td className="border-b border-line px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Link className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-cream transition hover:border-gold/60 hover:text-gold" href={`/grand-cru/${wine.slug}`}>
                      Details
                    </Link>
                    <Link className="rounded-lg bg-wine px-3 py-1.5 text-xs font-semibold text-cream transition hover:bg-gold hover:text-ink" href={`/search?wine=${encodeURIComponent(wine.name)}`}>
                      Search
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-hint">{filtered.length} of {wines.length} reference climats shown. Market data appears only on search results when returned by the backend.</p>
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-line bg-ink px-3">
      <span className="font-mono text-[10px] uppercase tracking-normal text-hint">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 bg-transparent text-sm text-cream focus:outline-none"
      >
        {options.map((option) => <option key={option} value={option} className="bg-ink text-cream">{option}</option>)}
      </select>
    </label>
  );
}

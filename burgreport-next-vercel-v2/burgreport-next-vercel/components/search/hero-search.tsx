'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GrandCru } from '@/types/burgreport';
import { cn } from '@/lib/utils/cn';

interface HeroSearchProps {
  wines: GrandCru[];
  variant?: 'hero' | 'compact';
  initialWine?: string;
  initialVintage?: string;
}

export function HeroSearch({ wines, variant = 'compact', initialWine = '', initialVintage = '' }: HeroSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const [query, setQuery] = useState(initialWine);
  const [vintage, setVintage] = useState(initialVintage.replace(/[^0-9]/g, '').slice(0, 4));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!normalized) return wines.slice(0, 8);
    return wines
      .filter((wine) => {
        const haystack = `${wine.name} ${wine.village} ${wine.cote}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return haystack.includes(normalized);
      })
      .slice(0, 8);
  }, [query, wines]);

  function submit(selected = query) {
    const wine = selected.trim();
    if (!wine) {
      inputRef.current?.focus();
      return;
    }
    const params = new URLSearchParams({ wine });
    if (vintage.trim()) params.set('vintage', vintage.trim());
    router.push(`/search?${params.toString()}`);
    setOpen(false);
  }

  function selectWine(wine: GrandCru) {
    setQuery(wine.name);
    setOpen(false);
    setActiveIndex(0);
    inputRef.current?.focus();
  }

  const listboxId = `${baseId}-listbox`;
  const activeOptionId = open && matches[activeIndex] ? `${baseId}-option-${activeIndex}` : undefined;

  return (
    <form
      className={cn(
        'relative rounded-2xl border border-line bg-surface/95 p-2 shadow-glow backdrop-blur',
        variant === 'compact' && 'shadow-card',
        variant === 'hero' && 'border-gold/20'
      )}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
        <div className="relative">
          <label htmlFor={`${baseId}-wine-search`} className="sr-only">Search Grand Cru</label>
          <input
            ref={inputRef}
            id={`${baseId}-wine-search`}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(event) => {
              if (!open) return;
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((value) => Math.min(value + 1, matches.length - 1));
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((value) => Math.max(value - 1, 0));
              }
              if (event.key === 'Enter' && matches[activeIndex] && query.trim().length > 0) {
                event.preventDefault();
                submit(matches[activeIndex].name);
              }
              if (event.key === 'Escape') setOpen(false);
            }}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            placeholder="Search La Tâche, Chambertin, Montrachet..."
            className="h-12 w-full rounded-xl border border-line bg-ink px-4 text-base text-cream placeholder:text-hint transition focus:border-gold"
          />
          {open && matches.length > 0 && (
            <div
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-80 overflow-y-auto rounded-xl border border-line bg-elevated p-2 shadow-card"
            >
              {matches.map((wine, index) => (
                <button
                  type="button"
                  id={`${baseId}-option-${index}`}
                  key={wine.slug}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectWine(wine)}
                  className={cn(
                    'flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition',
                    activeIndex === index ? 'bg-gold/12 text-gold' : 'text-cream hover:bg-surface hover:text-gold'
                  )}
                >
                  <span className={cn('h-2.5 w-2.5 rounded-full', wine.color === 'White' ? 'bg-gold' : 'bg-wine')} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{wine.name}{wine.isMonopole ? ' · Monopole' : ''}</span>
                    <span className="block truncate text-xs text-hint">{wine.village} · {wine.color} · {wine.cote}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor={`${baseId}-vintage`} className="sr-only">Vintage</label>
          <input
            id={`${baseId}-vintage`}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={vintage}
            onChange={(event) => setVintage(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="Vintage"
            className="h-12 w-full rounded-xl border border-line bg-ink px-4 font-mono text-base text-cream placeholder:font-sans placeholder:text-hint transition focus:border-gold"
          />
        </div>

        <button type="submit" className="h-12 rounded-xl bg-wine px-6 text-sm font-bold text-cream transition hover:bg-gold hover:text-ink">
          Search
        </button>
      </div>
    </form>
  );
}

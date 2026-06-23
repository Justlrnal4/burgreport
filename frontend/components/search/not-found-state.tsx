import Link from 'next/link';
import type { GrandCru } from '@/types/burgreport';

// Honest "we don't cover this yet" instead of a dead 404. Every non-Grand-Cru
// search is a real intent signal; here we keep the user moving (closest covered
// climats) and are straight about scope rather than pretending to cover the wine.
export function NotFoundState({ query, suggestions }: { query: string; suggestions: GrandCru[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <p className="font-mono text-xs uppercase tracking-normal text-gold">Not covered yet</p>
      <h2 className="mt-2 text-2xl font-semibold text-cream">
        BurgReport covers the 34 Grand Cru climats{query ? ` — not “${query}” yet.` : '.'}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        We&apos;d rather say so than guess. Premier Cru and village coverage is on the roadmap. In the meantime, here are the closest climats we do cover:
      </p>
      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((wine) => (
            <Link
              key={wine.slug}
              href={`/search?wine=${encodeURIComponent(wine.name)}`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-ink px-4 py-2 text-sm text-cream transition hover:border-gold/50 hover:text-gold"
            >
              <span className={`h-2 w-2 rounded-full ${wine.color === 'White' ? 'bg-gold' : 'bg-wine'}`} />
              {wine.name}
              <span className="font-mono text-xs text-hint">{wine.village}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

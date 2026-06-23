'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWatchlist, removeWatch, WATCHLIST_CHANGE_EVENT, type WatchItem } from '@/lib/watchlist';

export function WatchlistClient() {
  // null = not yet read on the client; avoids an SSR/hydration flash.
  const [items, setItems] = useState<WatchItem[] | null>(null);

  useEffect(() => {
    const sync = () => setItems(getWatchlist());
    sync();
    window.addEventListener(WATCHLIST_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WATCHLIST_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (items === null) {
    return <p className="mt-6 text-sm text-muted">Loading your saved climats…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
        <p className="text-sm leading-6 text-muted">
          No saved climats yet. Search a Grand Cru and hit <span className="text-gold">★ Save to watchlist</span> to track it here.
        </p>
        <Link
          href="/search"
          className="mt-4 inline-flex rounded-lg bg-wine px-4 py-2.5 text-sm font-bold text-cream transition hover:bg-gold hover:text-ink"
        >
          Start searching →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-2">
      {items.map((item) => (
        <div key={`${item.slug}-${item.vintage || ''}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/70 p-4">
          <Link
            href={`/search?wine=${encodeURIComponent(item.name)}${item.vintage ? `&vintage=${item.vintage}` : ''}`}
            className="min-w-0 flex-1"
          >
            <p className="truncate font-semibold text-cream">
              {item.name}
              {item.vintage ? <span className="ml-2 font-mono text-sm text-gold">{item.vintage}</span> : null}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-normal text-hint">Tap to re-check estimate</p>
          </Link>
          <button
            type="button"
            onClick={() => removeWatch(item.slug, item.vintage)}
            aria-label={`Remove ${item.name}${item.vintage ? ` ${item.vintage}` : ''} from watchlist`}
            className="shrink-0 rounded-full border border-line bg-elevated px-3 py-1.5 font-mono text-[10px] uppercase tracking-normal text-muted transition hover:border-danger/50 hover:text-danger"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

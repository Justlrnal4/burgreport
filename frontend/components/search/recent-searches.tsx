'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecents, WATCHLIST_CHANGE_EVENT, type RecentItem } from '@/lib/watchlist';

export function RecentSearches() {
  const [recents, setRecents] = useState<RecentItem[]>([]);

  useEffect(() => {
    const sync = () => setRecents(getRecents());
    sync();
    window.addEventListener(WATCHLIST_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WATCHLIST_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (recents.length === 0) return null;

  return (
    <div className="mb-5 rounded-2xl border border-line bg-surface/70 p-4">
      <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Recent searches</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {recents.map((item) => (
          <Link
            key={`${item.wine}-${item.vintage || ''}`}
            href={`/search?wine=${encodeURIComponent(item.wine)}${item.vintage ? `&vintage=${item.vintage}` : ''}`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-ink px-3 py-1.5 text-sm text-cream transition hover:border-gold/50 hover:text-gold"
          >
            {item.wine}
            {item.vintage ? <span className="font-mono text-xs text-gold">{item.vintage}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

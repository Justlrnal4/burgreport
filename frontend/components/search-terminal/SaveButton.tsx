'use client';

import { useEffect, useState } from 'react';
import { isWatched, toggleWatch, WATCHLIST_CHANGE_EVENT } from '@/lib/watchlist';
import { cn } from '@/lib/utils/cn';

export function SaveButton({ slug, name, vintage }: { slug: string; name: string; vintage?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isWatched(slug, vintage));
    sync();
    window.addEventListener(WATCHLIST_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WATCHLIST_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [slug, vintage]);

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleWatch({ slug, name, vintage }))}
      aria-pressed={saved}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-normal transition',
        saved ? 'border-gold/60 bg-gold/12 text-gold' : 'border-line bg-elevated text-muted-foreground hover:border-gold/50 hover:text-gold'
      )}
    >
      <span aria-hidden>{saved ? '★' : '☆'}</span>
      {saved ? 'Saved' : 'Save to watchlist'}
    </button>
  );
}

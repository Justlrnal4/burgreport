import type { Metadata } from 'next';
import { WatchlistClient } from '@/components/watchlist/watchlist-client';

export const metadata: Metadata = {
  title: 'Watchlist',
  description: 'Climats you are tracking on BurgReport.',
  alternates: { canonical: '/watchlist' },
  robots: { index: false, follow: true }
};

export default function WatchlistPage() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-normal text-gold">Watchlist</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-cream md:text-5xl">Climats you&apos;re tracking.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Saved on this device only — no account yet, nothing synced. Clearing your browser data clears this list.
          When accounts ship, these move with you.
        </p>
        <WatchlistClient />
      </div>
    </section>
  );
}

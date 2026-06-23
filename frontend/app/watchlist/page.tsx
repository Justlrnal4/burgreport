import type { Metadata } from 'next';
import { WatchlistClient } from '@/components/watchlist/watchlist-client';
import { PageHeader } from '@/components/site/page-header';

export const metadata: Metadata = {
  title: 'Watchlist',
  description: 'Climats you are tracking on BurgReport.',
  alternates: { canonical: '/watchlist' },
  robots: { index: false, follow: true }
};

export default function WatchlistPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          eyebrow="Watchlist"
          title="Climats you&rsquo;re tracking."
          description="Saved on this device only — no account yet, nothing synced. Clearing your browser data clears this list; when accounts ship, these move with you."
        />
        <WatchlistClient />
      </div>
    </section>
  );
}

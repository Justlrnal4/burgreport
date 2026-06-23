import Image from 'next/image';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-ink/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" aria-label="BurgReport home" className="inline-block">
            <Image
              src="/burgreport-logo.png"
              alt="BurgReport — Burgundy Grand Cru Intelligence"
              width={1500}
              height={836}
              className="h-auto w-[230px]"
            />
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-muted">
            Grand Cru Burgundy pricing intelligence for collectors, sommeliers, retailers, and investors.
            Estimated, reference, and unavailable fields are clearly labeled — never fabricated.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-cream">Product</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
            <Link className="hover:text-gold" href="/search">Search</Link>
            <Link className="hover:text-gold" href="/grand-cru">Grand Cru Guide</Link>
            <Link className="hover:text-gold" href="/vintages">Vintage Guide</Link>
            <Link className="hover:text-gold" href="/watchlist">Watchlist</Link>
            <Link className="hover:text-gold" href="/methodology">Methodology</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-cream">Data note</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            BurgReport separates estimated, reference, example, and unavailable data states — and reserves
            &ldquo;live&rdquo; for a future licensed feed — so pricing context stays honest.
          </p>
        </div>
      </div>
    </footer>
  );
}

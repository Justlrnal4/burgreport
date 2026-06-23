import Link from 'next/link';
import { BurgReportLogo } from '@/components/brand/burg-report-logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-ink/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <BurgReportLogo size="lg" />
            <p className="mt-6 max-w-md text-sm leading-6 text-muted">
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

        <div className="mt-12 flex flex-col gap-4 border-t border-line/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            © 2026 BurgReport · Built by <span className="text-cream">Justin Erwin</span>, Las Vegas
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-hint">
            <a href="mailto:justin@justinerwin.com" className="transition hover:text-gold">justin@justinerwin.com</a>
            <span aria-hidden className="hidden h-3 w-px bg-line sm:inline-block" />
            <a href="https://www.linkedin.com/in/justinerwinlv/" target="_blank" rel="noopener noreferrer" className="transition hover:text-gold">LinkedIn</a>
            <span aria-hidden className="hidden h-3 w-px bg-line sm:inline-block" />
            <a href="https://justinerwin.com" target="_blank" rel="noopener noreferrer" className="transition hover:text-gold">Portfolio ↗</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

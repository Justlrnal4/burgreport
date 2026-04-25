import Link from 'next/link';
import { BurgReportLogo } from '@/components/brand/burg-report-logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-ink/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <BurgReportLogo />
          <p className="mt-5 max-w-md text-sm leading-6 text-muted">
            Grand Cru Burgundy pricing intelligence for collectors, sommeliers, retailers, and investors. Backend-returned values, estimated context, and unavailable fields are labeled.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-cream">Product</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
            <Link className="hover:text-gold" href="/search">Search</Link>
            <Link className="hover:text-gold" href="/grand-cru">Grand Cru Guide</Link>
            <Link className="hover:text-gold" href="/vintages">Vintage Guide</Link>
            <Link className="hover:text-gold" href="/methodology">Methodology</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-cream">Data note</h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            BurgReport separates live, estimated, reference, example, and unavailable data states so pricing context stays transparent.
          </p>
        </div>
      </div>
    </footer>
  );
}

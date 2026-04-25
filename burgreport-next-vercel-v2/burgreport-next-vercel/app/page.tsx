import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { ValueGrid } from '@/components/landing/value-grid';

export const metadata: Metadata = {
  alternates: { canonical: '/' }
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValueGrid />
      <HowItWorks />
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-gold/25 bg-gold-wine p-[1px] shadow-glow">
          <div className="rounded-[calc(1rem-1px)] bg-ink px-6 py-10 text-center md:px-12">
            <p className="font-mono text-xs uppercase tracking-normal text-gold">Start here</p>
            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-cream md:text-5xl">Run a Grand Cru price check.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-muted">
              Search by climat, add a vintage when available, and review live, estimated, reference, or unavailable fields before acting on price.
            </p>
            <Link href="/search" className="mt-8 inline-flex rounded-xl bg-wine px-7 py-3 text-sm font-bold text-cream transition hover:bg-gold hover:text-ink">
              Open Search →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

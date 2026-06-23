import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { ValueGrid } from '@/components/landing/value-grid';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
  alternates: { canonical: '/' }
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Reveal><ValueGrid /></Reveal>
      <Reveal><HowItWorks /></Reveal>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gold/25 bg-gold-wine p-[1px] shadow-glow">
            <div className="rounded-[calc(1rem-1px)] bg-ink px-6 py-12 text-center md:px-12">
              <p className="eyebrow-rule font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Start here</p>
              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-cream md:text-5xl">Run a Grand Cru price check.</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted">
                Search by climat, add a vintage, and get a confidence-gated read on whether the price is
                defensible — estimated, reference, and unavailable fields clearly labeled, never fabricated.
              </p>
              <Link href="/search" className="mt-8 inline-flex rounded-xl bg-gold px-7 py-3 text-sm font-bold text-ink transition hover:bg-cream">
                Open Search →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

import Link from 'next/link';
import { HeroSearch } from '@/components/search/hero-search';
import { Reveal } from '@/components/motion/reveal';
import { VerdictDemo } from '@/components/landing/verdict-demo';
import { GRAND_CRUS } from '@/lib/data/grand-crus';

const sampleChecks = [
  { name: 'La Tâche', vintage: '2019' },
  { name: 'Romanée-Conti', vintage: '2018' },
  { name: 'Montrachet', vintage: '2014' },
  { name: 'Clos de la Roche', vintage: '2016' }
];

const trustMarks = ['34 Grand Cru climats', 'Web-sourced estimates', 'Confidence-gated', 'Never fabricated'];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
      <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
        {/* Left — the pitch and the search */}
        <div>
          <Reveal immediate>
            <p className="eyebrow-rule font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
              Grand Cru Burgundy · honest pricing intelligence
            </p>
          </Reveal>
          <Reveal immediate delay={70}>
            <h1 className="mt-6 text-balance font-display text-[2.5rem] font-medium leading-[1.08] tracking-tight text-cream sm:text-[3.3rem] lg:text-[2.95rem] xl:text-[3.6rem] 2xl:text-[4rem]">
              Know what every <span className="whitespace-nowrap text-gold">Grand&nbsp;Cru</span> is&nbsp;worth.
            </h1>
          </Reveal>
          <Reveal immediate delay={130}>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Paste the price you were quoted and get a straight, confidence-gated read on whether it&apos;s
              defensible — across all 34 Grand Cru climats. Honest estimates, clearly labeled, never fabricated.
            </p>
          </Reveal>

          <Reveal immediate delay={180} className="mt-9">
            <HeroSearch wines={GRAND_CRUS} variant="hero" />
            <div className="mt-4 flex flex-wrap gap-2">
              {sampleChecks.map((item) => (
                <Link
                  key={`${item.name}-${item.vintage}`}
                  href={`/search?wine=${encodeURIComponent(item.name)}&vintage=${item.vintage}`}
                  className="rounded-full border border-line bg-surface/60 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-gold/60 hover:text-gold"
                >
                  {item.name} <span className="font-mono text-gold">{item.vintage}</span>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal immediate delay={240} className="mt-9">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-normal text-hint">
              {trustMarks.map((mark, i) => (
                <span key={mark} className="flex items-center gap-4">
                  {i > 0 && <span className="text-line" aria-hidden>·</span>}
                  {mark}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right — show the product, don't just describe it */}
        <Reveal immediate delay={160} className="lg:pl-2">
          <VerdictDemo />
        </Reveal>
      </div>
    </section>
  );
}

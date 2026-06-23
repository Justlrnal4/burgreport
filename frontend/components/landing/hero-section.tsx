import Link from 'next/link';
import { HeroSearch } from '@/components/search/hero-search';
import { Reveal } from '@/components/motion/reveal';
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
    <section className="relative overflow-hidden px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow-rule font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
            Grand Cru Burgundy · honest pricing intelligence
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.03] tracking-tight text-cream sm:text-6xl lg:text-[4.5rem]">
            Know what every <span className="text-gold">Grand Cru</span> is worth.
          </h1>
        </Reveal>
        <Reveal delay={130}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
            Paste the price you were quoted and get a straight, confidence-gated read on whether it&apos;s
            defensible — across all 34 Grand Cru climats. Honest estimates, clearly labeled, never fabricated.
          </p>
        </Reveal>
      </div>

      <Reveal delay={180} className="mx-auto mt-10 max-w-2xl">
        <HeroSearch wines={GRAND_CRUS} variant="hero" />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {sampleChecks.map((item) => (
            <Link
              key={`${item.name}-${item.vintage}`}
              href={`/search?wine=${encodeURIComponent(item.name)}&vintage=${item.vintage}`}
              className="rounded-full border border-line bg-surface/60 px-3 py-1.5 text-sm text-muted transition hover:border-gold/60 hover:text-gold"
            >
              {item.name} <span className="font-mono text-gold">{item.vintage}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal delay={240} className="mx-auto mt-12 max-w-3xl">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-normal text-hint">
          {trustMarks.map((mark, i) => (
            <span key={mark} className="flex items-center gap-5">
              {i > 0 && <span className="text-line" aria-hidden>·</span>}
              {mark}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

import Link from 'next/link';

// An illustrative sample of a real Defensibility Verdict, clearly labeled "Sample read".
// The numbers are representative (the brand never passes off fabricated data as live),
// and the whole card links to the actual live search for Romanée-Conti 2018.
//
// Band scale: $16k–$36k. low 19.2 → 16% · avg 23.4 → 37% · high 28.5 → 62.5% · quote 34 → 90%.
const FACTORS = [
  { label: 'Scarcity', detail: 'Monopole · 1.81 ha' },
  { label: 'Vintage 2018', detail: 'Exceptional · 5/5' }
];

export function VerdictDemo() {
  return (
    <Link
      href="/search?wine=Roman%C3%A9e-Conti&vintage=2018"
      aria-label="See the live Romanée-Conti 2018 price check"
      className="group relative block rounded-2xl border border-gold/40 bg-ink/90 p-5 shadow-card backdrop-blur transition duration-300 hover:border-gold/60 hover:shadow-glow sm:p-6"
    >
      {/* hairline gold glow along the top edge */}
      <span aria-hidden className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-hint">Defensibility verdict</p>
          <p className="mt-1.5 font-display text-xl leading-snug text-cream sm:text-2xl">
            Romanée-Conti <span className="text-hint">2018</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-gold/60 bg-gold/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
          Well above
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-hint">You were quoted</span>
        <span className="font-mono text-[1.7rem] font-semibold leading-none text-cream sm:text-3xl">$34,000</span>
      </div>

      {/* where-it-sits band */}
      <div className="mt-4">
        <div className="relative h-7">
          <span className="absolute top-0 -translate-x-1/2 font-mono text-[10px] text-gold" style={{ left: '90%' }}>
            quote
          </span>
          <div className="absolute inset-x-0 bottom-1 h-1.5 rounded-full bg-line">
            <span className="absolute bottom-0 top-0 rounded-full bg-gradient-to-r from-wine/70 to-gold/80" style={{ left: '16%', width: '46.5%' }} />
            <span className="absolute -top-1 h-3.5 w-px bg-cream/80" style={{ left: '37%' }} />
            <span className="absolute -top-1.5 h-[18px] w-[2px] rounded bg-gold shadow-[0_0_8px_rgba(201,152,106,0.7)]" style={{ left: '90%' }} />
          </div>
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-hint">
          <span>listings $19.2k–$28.5k</span>
          <span>avg ~$23.4k · 11 sources</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        $34,000 sits about <span className="text-cream">45% above</span> the ~$23,400 average across 11 public listings —
        confidence <span className="text-cream">low</span>, unvalidated estimate, never authoritative.
      </p>

      {/* compact supporting factors (kept short so the card fits the fold) */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line/70 pt-4">
        {FACTORS.map((factor) => (
          <div key={factor.label}>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-hint">{factor.label}</p>
            <p className="mt-1 text-sm font-medium text-cream">{factor.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-hint">Sample read · live in real time</span>
        <span className="font-mono text-[11px] text-gold transition-transform duration-300 group-hover:translate-x-0.5">Run it live →</span>
      </div>
    </Link>
  );
}

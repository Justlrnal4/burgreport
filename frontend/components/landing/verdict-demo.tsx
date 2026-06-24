import Link from 'next/link';

// An illustrative sample of a real Defensibility Verdict, clearly labeled "Sample read".
// The numbers are representative (the brand never passes off fabricated data as live),
// and the whole card links to the actual live search for Romanée-Conti 2018.
//
// Band scale: $16k–$36k. low 19.2 → 16% · avg 23.4 → 37% · high 28.5 → 62.5% · quote 34 → 90%.
const FACTORS = [
  { basis: 'Reference', label: 'Scarcity', detail: 'Monopole — 1.81 ha, the smallest Grand Cru of the Côte de Nuits.' },
  { basis: 'Reference', label: 'Vintage 2018', detail: 'Rated Exceptional (5/5) — rich, opulent, age-worthy.' }
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

      <div className="mt-5 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-hint">You were quoted</span>
        <span className="font-mono text-[1.7rem] font-semibold leading-none text-cream sm:text-3xl">$34,000</span>
      </div>

      {/* where-it-sits band */}
      <div className="mt-5">
        <div className="relative h-8">
          {/* quote marker label */}
          <span className="absolute top-0 -translate-x-1/2 font-mono text-[10px] text-gold" style={{ left: '90%' }}>
            quote
          </span>
          <div className="absolute inset-x-0 bottom-1.5 h-1.5 rounded-full bg-line">
            {/* public-listings range */}
            <span className="absolute bottom-0 top-0 rounded-full bg-gradient-to-r from-wine/70 to-gold/80" style={{ left: '16%', width: '46.5%' }} />
            {/* average tick */}
            <span className="absolute -top-1 h-3.5 w-px bg-cream/80" style={{ left: '37%' }} />
            {/* quoted-price marker, sitting clearly to the right of the range */}
            <span className="absolute -top-1.5 h-[18px] w-[2px] rounded bg-gold shadow-[0_0_8px_rgba(201,152,106,0.7)]" style={{ left: '90%' }} />
          </div>
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-hint">
          <span>listings $19.2k–$28.5k</span>
          <span>avg ~$23.4k · 11 sources</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        $34,000 sits about <span className="text-cream">45% above</span> the ~$23,400 average across 11 public listings.
        Confidence: <span className="text-cream">low</span> — unvalidated estimate, never authoritative.
      </p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {FACTORS.map((factor) => (
          <li key={factor.label} className="rounded-xl border border-line bg-surface/70 p-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-line bg-elevated px-2 py-0.5 font-mono text-[9px] uppercase tracking-normal text-hint">
                {factor.basis}
              </span>
              <span className="text-sm font-semibold text-cream">{factor.label}</span>
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{factor.detail}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/70 pt-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-hint">Sample read · live-searched in real time</span>
        <span className="font-mono text-[11px] text-gold transition-transform duration-300 group-hover:translate-x-0.5">Run it live →</span>
      </div>
    </Link>
  );
}

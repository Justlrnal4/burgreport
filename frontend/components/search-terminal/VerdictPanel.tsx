import { ResultQualityBadge } from '@/components/data-quality/ResultQualityBadge';
import { formatUsd } from '@/lib/utils/format';
import type { SearchResult, VerdictStance } from '@/types/burgreport';

// Stance → accent. Deliberately NO green/success state: a web-sourced verdict is
// never authoritative. "Insufficient" reads neutral (the honest refusal), the
// rest read amber/cream — caution, not confirmation.
const STANCE_META: Record<VerdictStance, { tag: string; accent: string; chip: string }> = {
  insufficient: { tag: 'Too thin to call', accent: 'border-hint/40', chip: 'border-hint/40 bg-hint/10 text-hint' },
  context: { tag: 'Where it sits', accent: 'border-cream/25', chip: 'border-cream/30 bg-cream/10 text-cream' },
  in_line: { tag: 'In line', accent: 'border-cream/30', chip: 'border-cream/30 bg-cream/10 text-cream' },
  above: { tag: 'Above listings', accent: 'border-gold/40', chip: 'border-gold/50 bg-gold/12 text-gold' },
  well_above: { tag: 'Well above', accent: 'border-gold/55', chip: 'border-gold/60 bg-gold/15 text-gold' },
  below: { tag: 'Below listings', accent: 'border-gold/40', chip: 'border-gold/50 bg-gold/12 text-gold' }
};

const BASIS_LABEL: Record<'reference' | 'estimate', string> = {
  reference: 'Reference',
  estimate: 'Estimate'
};

export function VerdictPanel({ result }: { result: SearchResult }) {
  const verdict = result.verdict;
  if (!verdict) return null;

  const meta = STANCE_META[verdict.stance] ?? STANCE_META.context;

  return (
    <section className={`rounded-2xl border ${meta.accent} bg-ink p-5 shadow-card`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Defensibility verdict</p>
          <h2 className="mt-1 text-xl font-semibold leading-snug text-cream md:text-2xl">{verdict.headline}</h2>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-normal ${meta.chip}`}>
          {meta.tag}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">{verdict.summary}</p>

      {verdict.gate && (
        <div className="mt-3 rounded-xl border border-hint/30 bg-hint/5 p-3">
          <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Why we won&apos;t call it</p>
          <p className="mt-1 text-sm leading-6 text-cream">{verdict.gate}</p>
        </div>
      )}

      {verdict.factors.length > 0 && (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {verdict.factors.map((factor, index) => (
            <li key={index} className="rounded-xl border border-line bg-surface/70 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-line bg-elevated px-2 py-0.5 font-mono text-[9px] uppercase tracking-normal text-hint">
                  {BASIS_LABEL[factor.basis] ?? factor.basis}
                </span>
                <span className="font-semibold text-cream">{factor.label}</span>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{factor.detail}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {result.quality && <ResultQualityBadge quality={result.quality} />}
        {verdict.band.avg !== null && (
          <span className="font-mono text-xs text-hint">
            Public listings ~{formatUsd(verdict.band.avg)} · {verdict.sourceCount} source{verdict.sourceCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <p className="mt-3 text-xs leading-5 text-hint">{verdict.caveat}</p>
    </section>
  );
}

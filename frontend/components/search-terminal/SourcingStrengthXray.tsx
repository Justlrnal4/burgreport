import { formatUsd } from '@/lib/utils/format';
import type { SearchResult } from '@/types/burgreport';

// The "credit-score breakdown" of the estimate: the average on an uncertainty band
// (width = observed spread), plus the exact factors behind the confidence tier —
// the sentence a confident-but-opaque price source refuses to say. Pure UX over
// the data_quality factors the backend already computes.
export function SourcingStrengthXray({ result }: { result: SearchResult }) {
  const quality = result.quality;
  if (!quality || result.avgUsd === null) return null;

  const { sourceCount, spreadPct, ageHours, isSinglePoint, isStale } = quality.factors;
  const low = result.minUsd;
  const high = result.maxUsd;
  const avg = result.avgUsd;
  const hasBand = low !== null && high !== null && high > low;
  const avgPct = hasBand ? Math.min(100, Math.max(0, ((avg - low) / (high - low)) * 100)) : 50;

  const chips = [
    `${sourceCount} source${sourceCount === 1 ? '' : 's'}`,
    spreadPct !== null ? `${Math.round(spreadPct)}% spread` : null,
    ageHours !== null ? (ageHours < 24 ? 'fetched today' : `~${Math.round(ageHours / 24)}d old`) : null,
    isSinglePoint ? 'single observation' : null,
    isStale ? 'may be stale' : null
  ].filter(Boolean) as string[];

  return (
    <div className="mt-4 rounded-xl border border-line bg-surface/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Sourcing strength</p>
        <span className="font-mono text-[10px] uppercase tracking-normal text-hint">{quality.label}</span>
      </div>

      <div className="mt-3">
        {hasBand ? (
          <>
            <div className="relative h-2 rounded-full bg-elevated">
              <div className="absolute inset-y-0 rounded-full bg-gold/25" style={{ left: '0%', right: '0%' }} />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold bg-gold"
                style={{ left: `${avgPct}%` }}
                aria-hidden
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between font-mono text-xs text-muted">
              <span>{formatUsd(low)}</span>
              <span className="text-gold">avg {formatUsd(avg)}</span>
              <span>{formatUsd(high)}</span>
            </div>
          </>
        ) : (
          <p className="text-xs leading-5 text-muted">
            Single observed price ({formatUsd(avg)}) — no spread to show. A range needs at least two differing listings.
          </p>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-normal text-gold">Why this confidence</summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full border border-line bg-ink px-2 py-0.5 font-mono text-[10px] text-muted">
              {chip}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-hint">{quality.note}</p>
      </details>
    </div>
  );
}

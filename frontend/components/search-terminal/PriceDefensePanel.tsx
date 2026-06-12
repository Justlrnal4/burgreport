import { ResultQualityBadge } from '@/components/data-quality/ResultQualityBadge';
import type { DefenseBasis, SearchResult } from '@/types/burgreport';

const BASIS_LABEL: Record<DefenseBasis, string> = {
  reference: 'Reference',
  'vintage reference': 'Vintage ref',
  'web-sourced': 'Web-sourced'
};

function prettyDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function PriceDefensePanel({ result }: { result: SearchResult }) {
  const defense = result.defense;
  if (!defense) return null;

  return (
    <section className="rounded-2xl border border-line bg-ink p-4 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Defend this price</p>
          <h2 className="mt-1 text-lg font-semibold text-cream">{defense.headline}</h2>
        </div>
        {result.quality && <ResultQualityBadge quality={result.quality} />}
      </div>

      <ul className="grid gap-2">
        {defense.points.map((point, index) => (
          <li key={index} className="flex items-start gap-3 rounded-xl border border-line bg-surface/70 p-3">
            <span className="mt-0.5 shrink-0 rounded-full border border-line bg-elevated px-2 py-0.5 font-mono text-[9px] uppercase tracking-normal text-hint">
              {BASIS_LABEL[point.basis] ?? point.basis}
            </span>
            <p className="text-sm leading-6 text-cream">{point.text}</p>
          </li>
        ))}
      </ul>

      {defense.sources.length > 0 ? (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Sources</p>
          <ul className="mt-2 grid gap-1">
            {defense.sources.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono text-xs text-gold underline-offset-2 hover:underline"
                >
                  {prettyDomain(url)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-xs text-hint">No merchant sources were captured for this result.</p>
      )}

      <div className="mt-4 rounded-xl border border-line bg-surface/70 p-3">
        <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Copy-ready summary</p>
        <p className="mt-2 select-all text-sm leading-6 text-muted">{defense.summary}</p>
      </div>
    </section>
  );
}

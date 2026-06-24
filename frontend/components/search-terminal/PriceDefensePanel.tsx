import { CopyButtons, type CopyItem } from '@/components/search-terminal/CopyButtons';
import { ResultQualityBadge } from '@/components/data-quality/ResultQualityBadge';
import { formatUsd, prettyDomain } from '@/lib/utils/format';
import type { DefenseBasis, SearchResult } from '@/types/burgreport';

const BASIS_LABEL: Record<DefenseBasis, string> = {
  reference: 'Reference',
  'vintage reference': 'Vintage ref',
  'web-sourced': 'Web-sourced'
};

// Build the two copy-ready formats. The unvalidated-estimate caveat is baked into
// BOTH strings so a pasted line never reads as authoritative.
function buildCopyItems(result: SearchResult): CopyItem[] {
  const defense = result.defense!;
  const name = result.climat.name + (result.vintage ? ` ${result.vintage}` : '');
  const confidence = result.quality?.confidence;
  const sourceCount = defense.sources.length;

  let guest = `${name}: `;
  if (result.avgUsd !== null) {
    const range =
      result.minUsd !== null && result.maxUsd !== null && result.minUsd !== result.maxUsd
        ? `${formatUsd(result.minUsd)}–${formatUsd(result.maxUsd)} (around ${formatUsd(result.avgUsd)})`
        : `around ${formatUsd(result.avgUsd)}`;
    guest += `public listings put this at ${range}`;
    if (sourceCount) guest += ` across ${sourceCount} listing${sourceCount === 1 ? '' : 's'}`;
    if (confidence) guest += `, ${confidence} confidence`;
    guest += '. ';
  } else {
    guest += 'no web-sourced price was found. ';
  }
  guest += 'Unvalidated estimate — verify with the merchant.';

  const sellsheet = [
    defense.headline,
    '',
    ...defense.points.map((point) => `• ${point.text}`),
    sourceCount ? `\nSources: ${defense.sources.map(prettyDomain).join(', ')}` : '',
    `\n${defense.caveat}`
  ]
    .filter((line) => line !== '')
    .join('\n');

  return [
    { label: 'Copy as guest line', text: guest },
    { label: 'Copy as staff sell-sheet', text: sellsheet }
  ];
}

export function PriceDefensePanel({ result }: { result: SearchResult }) {
  const defense = result.defense;
  if (!defense) return null;

  const copyItems = buildCopyItems(result);

  return (
    <section className="rounded-2xl border border-line bg-ink p-4 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Defend this price · table-ready</p>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-normal text-hint">Copy-ready — caveat travels inside the text</p>
          <CopyButtons items={copyItems} />
        </div>
        <p className="mt-2 select-all text-sm leading-6 text-muted-foreground">{defense.summary}</p>
      </div>
    </section>
  );
}

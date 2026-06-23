import { PanelShell } from '@/components/search-terminal/PanelShell';
import { UnavailableState } from '@/components/search-terminal/UnavailableState';
import type { SearchResult } from '@/types/burgreport';

export function VintageContextPanel({ result }: { result: SearchResult }) {
  const hasVintageContext = Boolean(result.vintageStars || result.vintageLabel || result.vintageNote);

  return (
    <PanelShell title="Vintage context" eyebrow="Vintage signal" status={hasVintageContext ? 'reference' : 'unavailable'}>
      {hasVintageContext ? (
        <>
          <div className="flex items-center gap-3">
            <span className="font-mono text-4xl text-gold">{result.vintage || '—'}</span>
            <span className="text-xl text-gold">{'★'.repeat(result.vintageStars || 0)}{'☆'.repeat(Math.max(0, 5 - (result.vintageStars || 0)))}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-cream">{result.vintageLabel || 'Reference context'}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{result.vintageNote || 'Vintage note is unavailable for this query.'}</p>
        </>
      ) : (
        <UnavailableState detail={result.vintage ? 'Vintage signal is unavailable for this year and climat context.' : 'Add a vintage to inspect available vintage context.'} />
      )}
      <p className="mt-4 font-mono text-xs text-hint">Drinking window: {result.drinkingWindow || 'Unavailable'}</p>
    </PanelShell>
  );
}

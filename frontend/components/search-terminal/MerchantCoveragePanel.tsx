import Link from 'next/link';
import { PanelShell } from '@/components/search-terminal/PanelShell';
import { UnavailableState } from '@/components/search-terminal/UnavailableState';
import { formatUsd } from '@/lib/utils/format';
import type { SearchResult } from '@/types/burgreport';

export function MerchantCoveragePanel({ result }: { result: SearchResult }) {
  return (
    <PanelShell title="Merchant coverage" eyebrow="Source coverage" status={result.merchants.length ? 'live' : 'unavailable'}>
      {result.merchants.length ? (
        <div className="grid gap-2">
          {result.merchants.map((merchant) => {
            const row = (
              <div className="grid gap-2 rounded-xl border border-line bg-surface/70 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold text-cream">{merchant.merchant}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{merchant.source}</p>
                </div>
                <p className="font-mono text-gold">{formatUsd(merchant.priceUsd)}</p>
              </div>
            );
            return merchant.url ? (
              <Link key={`${merchant.merchant}-${merchant.url}`} href={merchant.url} className="block transition hover:opacity-85">
                {row}
              </Link>
            ) : (
              <div key={merchant.merchant}>{row}</div>
            );
          })}
        </div>
      ) : (
        <UnavailableState detail="Merchant/source coverage is unavailable unless returned by the backend. No merchant rows are fabricated." />
      )}
    </PanelShell>
  );
}

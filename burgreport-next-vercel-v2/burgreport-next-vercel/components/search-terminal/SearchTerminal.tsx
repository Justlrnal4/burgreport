import { ClimatReferencePanel } from '@/components/search-terminal/ClimatReferencePanel';
import { ComparablesPanel } from '@/components/search-terminal/ComparablesPanel';
import { MarketPricePanel } from '@/components/search-terminal/MarketPricePanel';
import { MerchantCoveragePanel } from '@/components/search-terminal/MerchantCoveragePanel';
import { MethodologyDisclosure } from '@/components/search-terminal/MethodologyDisclosure';
import { PriceHistoryPanel } from '@/components/search-terminal/PriceHistoryPanel';
import { ResultIdentityStrip } from '@/components/search-terminal/ResultIdentityStrip';
import { SourceAvailabilityMatrix } from '@/components/search-terminal/SourceAvailabilityMatrix';
import { VintageContextPanel } from '@/components/search-terminal/VintageContextPanel';
import type { SearchResult } from '@/types/burgreport';

export function SearchTerminal({ result }: { result: SearchResult }) {
  return (
    <div className="grid gap-4">
      <ResultIdentityStrip result={result} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
        <div className="grid gap-4">
          <MarketPricePanel result={result} />
          <SourceAvailabilityMatrix result={result} />
        </div>
        <div className="grid gap-4">
          <ClimatReferencePanel result={result} />
          <VintageContextPanel result={result} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <PriceHistoryPanel result={result} />
        <MerchantCoveragePanel result={result} />
        <ComparablesPanel result={result} />
      </div>

      <MethodologyDisclosure />
    </div>
  );
}

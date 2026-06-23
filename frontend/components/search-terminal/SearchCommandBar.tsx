import { HeroSearch } from '@/components/search/hero-search';
import { ShareResultButton } from '@/components/search-terminal/ShareResultButton';
import type { GrandCru } from '@/types/burgreport';

export function SearchCommandBar({ wines, initialWine, initialVintage, initialQuoted, canShare }: { wines: GrandCru[]; initialWine: string; initialVintage: string; initialQuoted?: string; canShare: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3 shadow-card">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <HeroSearch wines={wines} initialWine={initialWine} initialVintage={initialVintage} initialQuoted={initialQuoted} />
        {canShare && <ShareResultButton wine={initialWine} vintage={initialVintage || undefined} />}
      </div>
    </div>
  );
}

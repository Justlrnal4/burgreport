import type { Cote } from '@/types/burgreport';

export interface VintageInfo {
  year: number;
  cote: Cote;
  stars: number;
  label: string;
  note: string;
}

const YEARS = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005];

const NUIT_STARS: Record<number, [number, string]> = {
  2023: [4, 'Promising'], 2022: [5, 'Excellent'], 2021: [3, 'Selective'], 2020: [5, 'Exceptional'], 2019: [5, 'Exceptional'], 2018: [4, 'Powerful'], 2017: [4, 'Open'], 2016: [5, 'Classic'], 2015: [5, 'Legendary'], 2014: [4, 'Precise'], 2013: [3, 'Variable'], 2012: [4, 'Structured'], 2011: [3, 'Selective'], 2010: [5, 'Legendary'], 2009: [5, 'Ripe'], 2008: [4, 'Tense'], 2007: [3, 'Forward'], 2006: [4, 'Classic'], 2005: [5, 'Legendary']
};

const BEAUNE_STARS: Record<number, [number, string]> = {
  2023: [4, 'Promising'], 2022: [5, 'Excellent'], 2021: [3, 'Selective'], 2020: [5, 'Ripe'], 2019: [5, 'Exceptional'], 2018: [4, 'Powerful'], 2017: [4, 'Elegant'], 2016: [4, 'Classic'], 2015: [5, 'Rich'], 2014: [5, 'Excellent whites'], 2013: [3, 'Variable'], 2012: [4, 'Structured'], 2011: [3, 'Selective'], 2010: [5, 'Precise'], 2009: [4, 'Ripe'], 2008: [4, 'Tense'], 2007: [3, 'Forward'], 2006: [4, 'Classic'], 2005: [5, 'Powerful']
};

function makeNote(year: number, cote: Cote, label: string): string {
  return `${year} is treated as ${label.toLowerCase()} in this starter guide for ${cote}. Verify final vintage language against the production data source before publishing.`;
}

export const VINTAGES: VintageInfo[] = YEARS.flatMap((year) => {
  const nuits = NUIT_STARS[year];
  const beaune = BEAUNE_STARS[year];
  return [
    { year, cote: 'Côte de Nuits' as const, stars: nuits[0], label: nuits[1], note: makeNote(year, 'Côte de Nuits', nuits[1]) },
    { year, cote: 'Côte de Beaune' as const, stars: beaune[0], label: beaune[1], note: makeNote(year, 'Côte de Beaune', beaune[1]) }
  ];
});

export function getVintage(year: number | string | undefined, cote: Cote): VintageInfo | undefined {
  const parsed = Number(year);
  if (!Number.isFinite(parsed)) return undefined;
  return VINTAGES.find((vintage) => vintage.year === parsed && vintage.cote === cote);
}

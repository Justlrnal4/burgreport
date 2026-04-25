export type WineColor = 'Red' | 'White';
export type Grape = 'Pinot Noir' | 'Chardonnay';
export type Cote = 'Côte de Nuits' | 'Côte de Beaune';
export type DataSource = 'live' | 'estimated' | 'sample' | 'missing';

export interface GrandCru {
  id: number;
  slug: string;
  name: string;
  village: string;
  cote: Cote;
  color: WineColor;
  grape: Grape;
  sizeHa: number;
  isMonopole: boolean;
  summary: string;
  keyProducers: string[];
}

export interface ApiWine {
  id?: string | number;
  name?: string;
  slug?: string;
  aoc?: string;
  village?: string;
  cote?: Cote | string;
  color?: WineColor | string;
  grape?: Grape | string;
  grape_variety?: Grape | string;
  is_monopole?: boolean;
  size_ha?: number;
  key_producers?: string[];
  description?: string;
}

export interface BackendSearchResponse {
  climat?: {
    id?: string | number;
    name?: string;
    slug?: string;
    aoc?: string;
    village?: string;
    cote?: Cote | string;
    color?: WineColor | string;
    grape?: Grape | string;
    grape_variety?: Grape | string;
    size_ha?: number;
    is_monopole?: boolean;
    description?: string;
    key_producers?: string[];
    food_pairings?: string[];
  };
  price?: {
    avg_usd?: number | null;
    min_usd?: number | null;
    max_usd?: number | null;
    critic_score?: number | null;
    sources?: MerchantQuote[] | string[] | null;
    history?: PricePoint[] | null;
    drinking_window?: string | null;
  };
  vintage?: {
    year?: number | string | null;
    stars?: number | null;
    label?: string | null;
    note?: string | null;
  };
  meta?: {
    cache_hit?: boolean;
    response_ms?: number;
    source?: string;
    last_updated?: string;
  };
  error?: string;
}

export interface PricePoint {
  year: number;
  label: string;
  avgUsd: number;
  source: DataSource;
}

export interface MerchantQuote {
  merchant: string;
  priceUsd: number | null;
  url?: string;
  source: DataSource;
}

export interface ComparableWine {
  name: string;
  slug?: string;
  avgUsd: number | null;
  score: number | null;
  reason: string;
  source: DataSource;
}

export interface SearchResult {
  query: string;
  vintage?: string;
  climat: GrandCru;
  description: string;
  avgUsd: number | null;
  minUsd: number | null;
  maxUsd: number | null;
  criticScore: number | null;
  vintageStars: number | null;
  vintageLabel: string | null;
  vintageNote: string | null;
  drinkingWindow: string | null;
  merchants: MerchantQuote[];
  priceHistory: PricePoint[];
  comparables: ComparableWine[];
  cacheHit: boolean | null;
  responseMs: number | null;
  lastUpdated: string | null;
  dataSource: DataSource;
  sourceNotes: string[];
}

export interface SearchError {
  status: 'not-found' | 'backend-error' | 'invalid-query';
  message: string;
  detail?: string;
}

export interface SearchPayload {
  result: SearchResult | null;
  error: SearchError | null;
}

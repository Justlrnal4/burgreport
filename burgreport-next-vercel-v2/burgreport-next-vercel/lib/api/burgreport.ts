import 'server-only';
import { GRAND_CRUS, findGrandCruByName, getGrandCruBySlug, normalizeWineName, relatedGrandCrus } from '@/lib/data/grand-crus';
import { getVintage } from '@/lib/data/vintages';
import type {
  ApiWine,
  BackendSearchResponse,
  ComparableWine,
  DataSource,
  GrandCru,
  MerchantQuote,
  PricePoint,
  SearchPayload,
  SearchResult,
  WineColor,
  Grape
} from '@/types/burgreport';

const DEFAULT_BACKEND = 'https://burgreport-production.up.railway.app';

export function getBackendBaseUrl(): string {
  return (process.env.BURGREPORT_API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND).replace(/\/$/, '');
}

export function estimatesEnabled(): boolean {
  return process.env.BR_ENABLE_ESTIMATED_MARKET_DATA === 'true';
}

type BackendRequestInit = RequestInit & { next?: { revalidate?: number | false } };

export async function fetchBackendJson<T>(path: string, init?: BackendRequestInit): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const url = `${getBackendBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const requestInit = {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers || {})
      },
      ...(init?.cache ? { cache: init.cache } : {}),
      next: init?.next ?? { revalidate: 300 }
    } as BackendRequestInit;

    const response = await fetch(url, requestInit);

    if (!response.ok) {
      return { ok: false, status: response.status, message: `Backend returned ${response.status}` };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      status: 503,
      message: error instanceof Error ? error.message : 'Backend request failed'
    };
  }
}

export async function fetchWines(): Promise<GrandCru[]> {
  const response = await fetchBackendJson<{ wines?: ApiWine[]; count?: number } | ApiWine[]>('/api/wines');
  if (!response.ok) return GRAND_CRUS;

  const wines = Array.isArray(response.data) ? response.data : response.data.wines;
  if (!wines?.length) return GRAND_CRUS;

  const normalized = new Map(
    wines
      .map(normalizeApiWine)
      .filter((wine): wine is GrandCru => Boolean(wine))
      .map((wine) => [wine.slug, wine] as const)
  );

  return GRAND_CRUS.map((wine) => normalized.get(wine.slug) || wine);
}

export async function searchWine(wineName: string, vintage?: string): Promise<SearchPayload> {
  const cleaned = wineName.trim();
  if (!cleaned) {
    return { result: null, error: { status: 'invalid-query', message: 'Enter a Grand Cru name to search.' } };
  }

  const safeVintage = normalizeVintage(vintage);
  const query = new URLSearchParams({ wine_name: cleaned });
  if (safeVintage) query.set('vintage', safeVintage);

  const backend = await fetchBackendJson<BackendSearchResponse>(`/api/search?${query.toString()}`);
  if (!backend.ok) {
    if (backend.status === 404) {
      return {
        result: null,
        error: {
          status: 'not-found',
          message: 'Wine not found.',
          detail: 'Try searching by climat name, such as La Tâche, Chambertin, or Montrachet.'
        }
      };
    }

    const fallback = buildLocalFallback(cleaned, safeVintage);
    if (fallback) {
      return {
        result: {
          ...fallback,
          sourceNotes: [
            'Backend was unavailable, so this view uses local climat reference data only.',
            'No merchant quotes, history, or price intelligence are fabricated.'
          ],
          dataSource: 'missing'
        },
        error: {
          status: 'backend-error',
          message: 'Pricing service temporarily unavailable.',
          detail: backend.message
        }
      };
    }

    return {
      result: null,
      error: {
        status: 'backend-error',
        message: 'Pricing service temporarily unavailable.',
        detail: backend.message
      }
    };
  }

  return normalizeSearchResponse(cleaned, safeVintage, backend.data);
}

function normalizeApiWine(input: ApiWine): GrandCru | null {
  const name = input.name;
  if (!name) return null;

  const existing = input.slug ? getGrandCruBySlug(input.slug) : findGrandCruByName(name);
  const color = normalizeColor(input.color) || existing?.color;
  const grape = normalizeGrape(input.grape || input.grape_variety) || existing?.grape;

  if (!color || !grape) return existing || null;

  return {
    id: Number(input.id || existing?.id || 0),
    slug: input.slug || existing?.slug || normalizeWineName(name),
    name,
    village: input.village || existing?.village || 'Burgundy',
    cote: (input.cote === 'Côte de Beaune' || input.cote === 'Côte de Nuits' ? input.cote : existing?.cote) || 'Côte de Nuits',
    color,
    grape,
    sizeHa: typeof input.size_ha === 'number' ? input.size_ha : existing?.sizeHa || 0,
    isMonopole: Boolean(input.is_monopole ?? existing?.isMonopole),
    summary: input.description || existing?.summary || 'Grand Cru reference profile.',
    keyProducers: input.key_producers?.length ? input.key_producers : existing?.keyProducers || []
  };
}

function normalizeSearchResponse(query: string, requestedVintage: string | undefined, response: BackendSearchResponse): SearchPayload {
  const climatName = response.climat?.name || query;
  const local = response.climat?.slug ? getGrandCruBySlug(response.climat.slug) : findGrandCruByName(climatName);

  if (!response.climat && !local) {
    return {
      result: null,
      error: {
        status: 'not-found',
        message: 'Wine not found.',
        detail: 'Try searching by climat name, such as La Tâche, Chambertin, or Montrachet.'
      }
    };
  }

  const color = normalizeColor(response.climat?.color) || local?.color || 'Red';
  const grape = normalizeGrape(response.climat?.grape || response.climat?.grape_variety) || local?.grape || (color === 'White' ? 'Chardonnay' : 'Pinot Noir');
  const climat: GrandCru = {
    id: Number(response.climat?.id || local?.id || 0),
    slug: response.climat?.slug || local?.slug || normalizeWineName(climatName),
    name: response.climat?.name || local?.name || query,
    village: response.climat?.village || local?.village || 'Burgundy',
    cote: (response.climat?.cote === 'Côte de Beaune' || response.climat?.cote === 'Côte de Nuits' ? response.climat.cote : local?.cote) || 'Côte de Nuits',
    color,
    grape,
    sizeHa: typeof response.climat?.size_ha === 'number' ? response.climat.size_ha : local?.sizeHa || 0,
    isMonopole: Boolean(response.climat?.is_monopole ?? local?.isMonopole),
    summary: response.climat?.description || local?.summary || 'Grand Cru reference profile.',
    keyProducers: response.climat?.key_producers?.length ? response.climat.key_producers : local?.keyProducers || []
  };

  const vintageInfo = getVintage(response.vintage?.year || requestedVintage, climat.cote);
  const avgUsd = nullableNumber(response.price?.avg_usd);
  const history = normalizeHistory(response.price?.history);
  const merchants = normalizeMerchants(response.price?.sources);
  const comparables = normalizeComparables(response, climat);
  const sourceNotes: string[] = [];

  if (!history.length) sourceNotes.push('Price history is not shown because the backend did not return historical data.');
  if (!merchants.length) sourceNotes.push('Merchant quotes are not shown unless returned by the backend.');
  if (!comparables.length) sourceNotes.push('Comparables are hidden unless returned by the backend or enabled as clearly labeled estimates.');
  if (avgUsd === null) sourceNotes.push('Average price is unavailable for this result.');

  return {
    result: {
      query,
      vintage: String(response.vintage?.year || requestedVintage || ''),
      climat,
      description: response.climat?.description || climat.summary,
      avgUsd,
      minUsd: nullableNumber(response.price?.min_usd),
      maxUsd: nullableNumber(response.price?.max_usd),
      criticScore: nullableNumber(response.price?.critic_score),
      vintageStars: nullableNumber(response.vintage?.stars) ?? vintageInfo?.stars ?? null,
      vintageLabel: response.vintage?.label || vintageInfo?.label || null,
      vintageNote: response.vintage?.note || vintageInfo?.note || null,
      drinkingWindow: response.price?.drinking_window || null,
      merchants,
      priceHistory: history,
      comparables,
      cacheHit: typeof response.meta?.cache_hit === 'boolean' ? response.meta.cache_hit : null,
      responseMs: nullableNumber(response.meta?.response_ms),
      lastUpdated: response.meta?.last_updated || null,
      dataSource: avgUsd === null ? 'missing' : 'live',
      sourceNotes
    },
    error: null
  };
}

function buildLocalFallback(query: string, vintage?: string): SearchResult | null {
  const local = findGrandCruByName(query);
  if (!local) return null;
  const vintageInfo = getVintage(vintage, local.cote);
  return {
    query,
    vintage: vintage || '',
    climat: local,
    description: local.summary,
    avgUsd: null,
    minUsd: null,
    maxUsd: null,
    criticScore: null,
    vintageStars: vintageInfo?.stars || null,
    vintageLabel: vintageInfo?.label || null,
    vintageNote: vintageInfo?.note || null,
    drinkingWindow: null,
    merchants: [],
    priceHistory: [],
    comparables: [],
    cacheHit: null,
    responseMs: null,
    lastUpdated: null,
    dataSource: 'missing',
    sourceNotes: []
  };
}

function normalizeHistory(history: unknown): PricePoint[] {
  if (!Array.isArray(history)) return [];
  return history
    .map((point) => {
      if (!point || typeof point !== 'object') return null;
      const record = point as Record<string, unknown>;
      const year = Number(record.year || record.label);
      const avgUsd = nullableNumber(record.avgUsd) ?? nullableNumber(record.avg_usd) ?? nullableNumber(record.price);
      if (!Number.isFinite(year) || avgUsd === null) return null;
      return { year, label: String(record.label || year), avgUsd, source: normalizeSource(record.source) } satisfies PricePoint;
    })
    .filter(Boolean) as PricePoint[];
}

function normalizeMerchants(sources: MerchantQuote[] | string[] | null | undefined): MerchantQuote[] {
  if (!Array.isArray(sources)) return [];
  return sources
    .map((source) => {
      if (typeof source === 'string') {
        return { merchant: source, priceUsd: null, source: 'live' as DataSource };
      }
      if (!source || typeof source !== 'object') return null;
      return {
        merchant: source.merchant || 'Merchant',
        priceUsd: nullableNumber(source.priceUsd) ?? nullableNumber((source as unknown as { price_usd?: unknown }).price_usd),
        url: source.url,
        source: normalizeSource(source.source)
      } satisfies MerchantQuote;
    })
    .filter(Boolean) as MerchantQuote[];
}

function normalizeComparables(response: BackendSearchResponse, climat: GrandCru): ComparableWine[] {
  const raw = (response as unknown as { comparables?: ComparableWine[] }).comparables;
  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const record = item as unknown as Record<string, unknown>;
        const name = typeof record.name === 'string' ? record.name : undefined;
        if (!name) return null;
        return {
          name,
          slug: typeof record.slug === 'string' ? record.slug : undefined,
          avgUsd: nullableNumber(record.avgUsd) ?? nullableNumber(record.avg_usd),
          score: nullableNumber(record.score) ?? nullableNumber(record.critic_score),
          reason: typeof record.reason === 'string' ? record.reason : 'Backend comparable',
          source: normalizeSource(record.source)
        } satisfies ComparableWine;
      })
      .filter(Boolean) as ComparableWine[];
  }

  if (!estimatesEnabled()) return [];

  return relatedGrandCrus(climat, 3).map((wine) => ({
    name: wine.name,
    slug: wine.slug,
    avgUsd: null,
    score: null,
    reason: `Same ${wine.cote} reference set. Pricing must be confirmed by backend data.`,
    source: 'estimated'
  }));
}

function normalizeColor(value: unknown): WineColor | undefined {
  if (value === 'Red' || value === 'red') return 'Red';
  if (value === 'White' || value === 'white') return 'White';
  return undefined;
}

function normalizeGrape(value: unknown): Grape | undefined {
  if (value === 'Pinot Noir' || value === 'pinot_noir') return 'Pinot Noir';
  if (value === 'Chardonnay' || value === 'chardonnay') return 'Chardonnay';
  return undefined;
}

function normalizeVintage(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (!/^\d{4}$/.test(trimmed)) return undefined;
  const year = Number(trimmed);
  if (year < 1900 || year > new Date().getFullYear() + 1) return undefined;
  return trimmed;
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSource(value: unknown): DataSource {
  if (value === 'live' || value === 'estimated' || value === 'sample' || value === 'missing') return value;
  return 'live';
}

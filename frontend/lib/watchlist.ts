// Device-local watchlist + recent searches.
//
// Honest stub for the account-backed version: this persists to localStorage on
// THIS device only (no sync, no account yet). The UI says so plainly. When real
// Supabase Auth lands, the same read/toggle API can be backed by the server with
// no component changes.

export interface WatchItem {
  slug: string;
  name: string;
  vintage?: string;
  savedAt: number;
}

export interface RecentItem {
  wine: string;
  vintage?: string;
  at: number;
}

const WATCH_KEY = 'burgreport:watchlist';
const RECENT_KEY = 'burgreport:recents';
export const WATCHLIST_CHANGE_EVENT = 'burgreport:watchlist-change';
const MAX_RECENTS = 6;

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(WATCHLIST_CHANGE_EVENT));
  } catch {
    // storage disabled or over quota — fail silently, never break the page
  }
}

const keyOf = (slug: string, vintage?: string) => `${slug}::${vintage || ''}`;

export function getWatchlist(): WatchItem[] {
  return read<WatchItem>(WATCH_KEY).sort((a, b) => b.savedAt - a.savedAt);
}

export function isWatched(slug: string, vintage?: string): boolean {
  const target = keyOf(slug, vintage);
  return read<WatchItem>(WATCH_KEY).some((item) => keyOf(item.slug, item.vintage) === target);
}

/** Toggle membership. Returns the new saved state. */
export function toggleWatch(item: Omit<WatchItem, 'savedAt'>): boolean {
  const list = read<WatchItem>(WATCH_KEY);
  const target = keyOf(item.slug, item.vintage);
  const exists = list.some((entry) => keyOf(entry.slug, entry.vintage) === target);
  const next = exists
    ? list.filter((entry) => keyOf(entry.slug, entry.vintage) !== target)
    : [...list, { ...item, savedAt: Date.now() }];
  write(WATCH_KEY, next);
  return !exists;
}

export function removeWatch(slug: string, vintage?: string): void {
  const target = keyOf(slug, vintage);
  write(WATCH_KEY, read<WatchItem>(WATCH_KEY).filter((entry) => keyOf(entry.slug, entry.vintage) !== target));
}

export function recordRecent(item: Omit<RecentItem, 'at'>): void {
  if (!item.wine) return;
  const target = keyOf(item.wine, item.vintage);
  const list = read<RecentItem>(RECENT_KEY).filter((entry) => keyOf(entry.wine, entry.vintage) !== target);
  write(RECENT_KEY, [{ ...item, at: Date.now() }, ...list].slice(0, MAX_RECENTS));
}

export function getRecents(): RecentItem[] {
  return read<RecentItem>(RECENT_KEY);
}

export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Not available';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function titleCase(value: string): string {
  return value
    .split(' ')
    .map((part) => (part.length ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part))
    .join(' ');
}

// Source links are presented as their bare merchant domain (no scheme, no path,
// no tracking params), never the raw URL string. Falls back to the input if it
// is not a parseable URL.
export function prettyDomain(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}

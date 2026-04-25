'use client';

import { useState } from 'react';

export function ShareResultButton({ wine, vintage }: { wine: string; vintage?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const params = new URLSearchParams({ wine });
    if (vintage) params.set('vintage', vintage);
    const href = `${window.location.origin}/search?${params.toString()}`;
    await navigator.clipboard.writeText(href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="h-12 rounded-xl border border-line px-4 text-sm font-semibold text-cream transition hover:border-gold/60 hover:text-gold"
      aria-label="Copy shareable search result URL"
    >
      {copied ? 'Copied' : 'Share result'}
    </button>
  );
}

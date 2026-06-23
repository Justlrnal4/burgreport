'use client';

import { useState } from 'react';

export interface CopyItem {
  label: string;
  text: string;
}

// Small clipboard island. The honest caveat + source basis travel INSIDE each
// copied string (badges strip on paste), so a pasted line can never read as more
// authoritative than the in-app result.
export function CopyButtons({ items }: { items: CopyItem[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(item: CopyItem) {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopied(item.label);
      window.setTimeout(() => setCopied((current) => (current === item.label ? null : current)), 1800);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => copy(item)}
          aria-label={`Copy: ${item.label}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elevated px-3 py-1.5 font-mono text-[10px] uppercase tracking-normal text-cream transition hover:border-gold/50 hover:text-gold"
        >
          {copied === item.label ? 'Copied ✓' : item.label}
        </button>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BurgReportLogo } from '@/components/brand/burg-report-logo';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/grand-cru', label: 'Grand Cru Guide' },
  { href: '/vintages', label: 'Vintages' }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/95 shadow-[0_1px_0_rgba(201,152,106,0.05)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BurgReportLogo />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {NAV.map((item) => {
            const targetPath = item.href.split('#')[0] || '/';
            const active = targetPath !== '/' && pathname?.startsWith(targetPath);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'font-mono text-[11px] uppercase tracking-normal text-muted transition hover:text-gold',
                  active && 'text-gold'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="hidden rounded-lg bg-wine px-4 py-2.5 text-sm font-bold text-cream shadow-[0_10px_24px_rgba(155,45,74,0.22)] transition hover:bg-gold hover:text-ink sm:inline-flex">
            Start Searching →
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-cream transition hover:border-gold/60 md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span className="text-xl">{open ? '×' : '☰'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-ink/96 px-4 py-4 backdrop-blur-md md:hidden" aria-label="Mobile primary">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-cream transition hover:border-gold/60"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-wine px-4 py-3 text-sm font-bold text-cream transition hover:bg-gold hover:text-ink"
            >
              Start Searching →
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

interface IconProps {
  className?: string;
}

export function BurgReportIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 80 108" className={cn('block', className)} aria-hidden="true">
      <path
        d="M18 8h44L52 54c-2.3 10.5-9 16.5-12 16.5S30.3 64.5 28 54L18 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M23 45c6.6-9.4 20.7-12.4 34 0-4.9 12.2-12.3 18-17 18S27.9 57.2 23 45Z"
        fill="var(--br-wine)"
        stroke="var(--br-gold)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M40 70v17" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M40 87 55 100 40 113 25 100Z" transform="translate(0 -8)" fill="var(--br-wine)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

export function BurgReportWordmark({ size = 'sm' }: { size?: 'sm' | 'hero' }) {
  return (
    <span className={cn('inline-flex items-baseline font-black uppercase leading-none tracking-normal', size === 'sm' ? 'text-[15px]' : 'text-4xl sm:text-5xl')}>
      <span className="text-wine">Burg</span>
      <span className="text-cream">Report</span>
    </span>
  );
}

export function BurgReportLogo({ compact = false, className }: LogoProps) {
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-3', compact && 'gap-2', className)} aria-label="BurgReport home">
      <span className="text-gold transition group-hover:text-cream">
        <BurgReportIcon className={compact ? 'h-9 w-7' : 'h-11 w-8'} />
      </span>
      {!compact && (
        <span className="flex flex-col">
          <BurgReportWordmark />
          <span className="mt-1 font-mono text-[9px] uppercase tracking-normal text-hint">Grand Cru Intel</span>
        </span>
      )}
    </Link>
  );
}

export function BurgReportHeroLockup() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="text-gold drop-shadow-[0_0_20px_rgba(201,152,106,0.14)]">
        <BurgReportIcon className="h-10 w-8 sm:h-12 sm:w-10" />
      </span>
      <div>
        <BurgReportWordmark size="hero" />
        <p className="mt-1 font-mono text-[10px] uppercase tracking-normal text-wine sm:text-xs">
          Burgundy Grand Cru Intelligence
        </p>
      </div>
    </div>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function BurgReportWordmark({ size = 'sm' }: { size?: 'sm' | 'hero' }) {
  return (
    <span className={cn('inline-flex items-baseline font-black uppercase leading-none tracking-normal', size === 'sm' ? 'text-[16px]' : 'text-4xl sm:text-5xl')}>
      <span className="text-wine">Burg</span>
      <span className="text-gold">Report</span>
    </span>
  );
}

export function BurgReportLogo({ compact = false, className }: LogoProps) {
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label="BurgReport home">
      <Image
        src="/burgreport-glass.png"
        alt=""
        width={146}
        height={360}
        priority
        className={cn('w-auto transition-transform duration-300 group-hover:scale-[1.06]', compact ? 'h-9' : 'h-11')}
      />
      {!compact && (
        <span className="flex flex-col">
          <BurgReportWordmark />
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-hint">Grand Cru Intelligence</span>
        </span>
      )}
    </Link>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function BurgReportWordmark({ size = 'sm' }: { size?: 'sm' | 'hero' }) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline font-serif font-semibold uppercase leading-none',
        size === 'sm' ? 'text-[17px] tracking-[0.04em]' : 'text-[28px] tracking-[0.03em] sm:text-[34px]'
      )}
    >
      <span className="text-wine">Burg</span>
      <span className="text-gold">Report</span>
    </span>
  );
}

export function BurgReportLogo({
  compact = false,
  size = 'sm',
  className
}: {
  compact?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const glassH = compact ? 'h-9' : size === 'lg' ? 'h-[4.25rem]' : 'h-12';
  return (
    <Link href="/" className={cn('group inline-flex items-center', size === 'lg' ? 'gap-3.5' : 'gap-2.5', className)} aria-label="BurgReport home">
      <Image
        src="/burgreport-glass.png"
        alt=""
        width={927}
        height={1855}
        priority
        className={cn('w-auto transition-transform duration-300 group-hover:scale-[1.05]', glassH)}
      />
      {!compact && (
        <span className="flex flex-col">
          <BurgReportWordmark size={size === 'lg' ? 'hero' : 'sm'} />
          <span
            className={cn(
              'font-mono uppercase text-hint',
              size === 'lg' ? 'mt-1.5 text-[10px] tracking-[0.24em]' : 'mt-1 text-[8px] tracking-[0.22em]'
            )}
          >
            Grand Cru Intelligence
          </span>
        </span>
      )}
    </Link>
  );
}

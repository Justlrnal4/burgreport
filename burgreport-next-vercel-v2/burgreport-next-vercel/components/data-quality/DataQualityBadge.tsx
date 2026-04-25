import { cn } from '@/lib/utils/cn';
import type { DataStatus } from '@/types/burgreport';

interface DataQualityBadgeProps {
  status: DataStatus;
  compact?: boolean;
  className?: string;
}

const STATUS_META: Record<DataStatus, { label: string; title: string; className: string }> = {
  live: {
    label: 'Live',
    title: 'Live: returned by backend',
    className: 'border-success/45 bg-success/10 text-success'
  },
  estimated: {
    label: 'Estimated',
    title: 'Estimated: calculated or inferred and labeled',
    className: 'border-gold/50 bg-gold/10 text-gold'
  },
  reference: {
    label: 'Reference',
    title: 'Reference: static climat or vintage context',
    className: 'border-cream/25 bg-cream/8 text-cream'
  },
  unavailable: {
    label: 'Unavailable',
    title: 'Unavailable: not enough source data',
    className: 'border-danger/40 bg-danger/10 text-danger'
  },
  example: {
    label: 'Example',
    title: 'Example: illustrative preview only',
    className: 'border-wine/55 bg-wine/15 text-cream'
  }
};

export function DataQualityBadge({ status, compact = false, className }: DataQualityBadgeProps) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-mono text-[10px] uppercase tracking-normal',
        compact ? 'px-2 py-0.5' : 'px-3 py-1',
        meta.className,
        className
      )}
      aria-label={meta.title}
      title={meta.title}
    >
      {compact ? meta.label : meta.title}
    </span>
  );
}

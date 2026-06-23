import { cn } from '@/lib/utils/cn';
import type { QualityConfidence, ResultQuality } from '@/types/burgreport';

// Confidence never reads as authoritative: gray → amber → bright-neutral.
// Intentionally no green/success state for web-parsed prices.
const CONFIDENCE_META: Record<QualityConfidence, string> = {
  unavailable: 'border-hint/40 bg-hint/10 text-hint',
  low: 'border-gold/50 bg-gold/12 text-gold',
  moderate: 'border-cream/30 bg-cream/10 text-cream'
};

export function ResultQualityBadge({ quality, className }: { quality: ResultQuality; className?: string }) {
  const meta = CONFIDENCE_META[quality.confidence] ?? CONFIDENCE_META.unavailable;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-normal',
        meta,
        className
      )}
      title={quality.note}
      aria-label={`Data quality: ${quality.label}. ${quality.note}`}
    >
      <span className="font-semibold">{quality.label}</span>
      <span className="opacity-70">· {quality.confidence} confidence</span>
    </span>
  );
}

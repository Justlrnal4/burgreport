import type { PricePoint } from '@/types/burgreport';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';
import { formatUsd } from '@/lib/utils/format';

export function PriceTrendChart({ points }: { points: PricePoint[] }) {
  if (points.length < 2) {
    return (
      <div className="rounded-2xl border border-line bg-ink p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-normal text-hint">Price history</p>
          <DataQualityBadge status="unavailable" compact />
        </div>
        <p className="mt-3 text-sm text-muted">Historical price data is unavailable unless returned by the backend.</p>
      </div>
    );
  }

  const width = 680;
  const height = 220;
  const padding = 34;
  const values = points.map((point) => point.avgUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);
  const path = points
    .map((point, index) => {
      const x = padding + (index / (points.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.avgUsd - min) / spread) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="rounded-2xl border border-line bg-ink p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-normal text-gold">Price history</p>
          <p className="mt-1 text-xs text-hint">Shown only when returned by backend or explicitly labeled estimated.</p>
        </div>
        <DataQualityBadge status={points.every((point) => point.source === 'estimated') ? 'estimated' : 'live'} compact />
        <span className="font-mono text-xs text-muted">{points[0].label} → {points[points.length - 1].label}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-5 h-56 w-full" role="img" aria-label="Average price history line chart">
        <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#332331" />
        <line x1={padding} x2={padding} y1={padding} y2={height - padding} stroke="#332331" />
        <path d={path} fill="none" stroke="#C9986A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => {
          const x = padding + (index / (points.length - 1)) * (width - padding * 2);
          const y = height - padding - ((point.avgUsd - min) / spread) * (height - padding * 2);
          return <circle key={`${point.label}-${point.avgUsd}`} cx={x} cy={y} r="5" fill="#9B2D4A" stroke="#C9986A" strokeWidth="2" />;
        })}
      </svg>
      <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs text-muted">
        <span>{formatUsd(min)} low</span>
        <span>{formatUsd(max)} high</span>
      </div>
    </div>
  );
}

import type { DataSource } from '@/types/burgreport';
import { DataQualityBadge, type DataQualityStatus } from '@/components/data-quality/DataQualityBadge';

export function DataSourceBadge({ source }: { source: DataSource }) {
  const statuses: Record<DataSource, DataQualityStatus> = {
    live: 'live',
    estimated: 'estimated',
    sample: 'example',
    missing: 'unavailable'
  };

  return <DataQualityBadge status={statuses[source]} />;
}

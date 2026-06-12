import type { DataSource, DataStatus } from '@/types/burgreport';
import { DataQualityBadge } from '@/components/data-quality/DataQualityBadge';

export function DataSourceBadge({ source }: { source: DataSource }) {
  const statuses: Record<DataSource, DataStatus> = {
    live: 'live',
    estimated: 'estimated',
    sample: 'example',
    missing: 'unavailable'
  };

  return <DataQualityBadge status={statuses[source]} />;
}

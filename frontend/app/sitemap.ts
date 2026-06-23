import type { MetadataRoute } from 'next';
import { GRAND_CRUS } from '@/lib/data/grand-crus';
import { getSiteUrl } from '@/lib/utils/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const now = new Date();

  return [
    { url: `${site}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${site}/vintages`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${site}/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${site}/grand-cru`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    ...GRAND_CRUS.map((wine) => ({
      url: `${site}/grand-cru/${wine.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    }))
  ];
}

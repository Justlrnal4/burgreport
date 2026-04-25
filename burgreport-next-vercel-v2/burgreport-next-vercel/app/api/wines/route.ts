import { NextResponse } from 'next/server';
import { fetchBackendJson } from '@/lib/api/burgreport';
import { GRAND_CRUS } from '@/lib/data/grand-crus';

export async function GET() {
  const backend = await fetchBackendJson('/api/wines');

  return NextResponse.json(
    {
      count: GRAND_CRUS.length,
      wines: GRAND_CRUS.map((wine) => ({
        id: wine.slug,
        slug: wine.slug,
        name: wine.name,
        aoc: `${wine.name} Grand Cru`,
        village: wine.village,
        cote: wine.cote,
        color: wine.color,
        grape: wine.grape,
        size_ha: wine.sizeHa,
        is_monopole: wine.isMonopole,
        description: wine.summary,
        key_producers: wine.keyProducers
      })),
      source: 'local-reference',
      backendAvailable: backend.ok
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
    }
  );
}

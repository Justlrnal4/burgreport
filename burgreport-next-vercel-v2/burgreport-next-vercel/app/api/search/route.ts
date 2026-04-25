import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendJson } from '@/lib/api/burgreport';

export async function GET(request: NextRequest) {
  const incoming = request.nextUrl.searchParams;
  const wineName = incoming.get('wine_name') || incoming.get('wine');
  const vintage = incoming.get('vintage');

  if (!wineName?.trim()) {
    return NextResponse.json({ error: 'Missing wine_name parameter.' }, { status: 400 });
  }

  const params = new URLSearchParams({ wine_name: wineName.trim() });
  if (vintage?.trim()) params.set('vintage', vintage.trim());

  const backend = await fetchBackendJson(`/api/search?${params.toString()}`);
  if (!backend.ok) {
    return NextResponse.json({ error: backend.message }, { status: backend.status });
  }

  return NextResponse.json(backend.data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' }
  });
}

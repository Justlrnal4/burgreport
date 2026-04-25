import { NextResponse } from 'next/server';
import { fetchBackendJson } from '@/lib/api/burgreport';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backend = await fetchBackendJson('/health', { next: { revalidate: 0 } });
  return NextResponse.json({
    app: 'ok',
    backend: backend.ok ? 'ok' : 'unavailable',
    backendStatus: backend.ok ? 200 : backend.status,
    timestamp: new Date().toISOString()
  }, { status: backend.ok ? 200 : 503 });
}

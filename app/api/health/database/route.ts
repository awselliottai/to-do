import { NextResponse } from 'next/server';

import { pingDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A non-sensitive connectivity probe for deployment and local smoke checks. */
export async function GET() {
  try {
    const connected = await pingDb('pooled');

    if (!connected) {
      console.error('[db-health] Database ping returned an unexpected response');
      return NextResponse.json({ ok: false, database: 'unavailable' }, { status: 503 });
    }

    return NextResponse.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('[db-health] Database connectivity check failed', error);
    return NextResponse.json({ ok: false, database: 'unavailable' }, { status: 503 });
  }
}

// app/api/db-debug/route.ts
import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getPool();

    // Info rápida de la conexión
    const info = await pool.query<{
      now: string; user: string; db: string; ver: string;
    }>(`select now(), current_user as user, current_database() as db, version() as ver`);

    // Conteo de suppliers directamente desde la DB
    const s = await pool.query<{ count: number }>(
      `select count(*)::int as count from public.suppliers`
    );

    return NextResponse.json({
      ok: true,
      env: {
        PGHOST: process.env.PGHOST,
        PGPORT: process.env.PGPORT,
        PGDATABASE: process.env.PGDATABASE,
        PGUSER: process.env.PGUSER,
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing',
      },
      db: info.rows?.[0] ?? null,
      suppliers: s.rows?.[0]?.count ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, stack: e.stack }, { status: 500 });
  }
}

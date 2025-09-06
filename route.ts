import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sp = url.searchParams;

    const year = sp.get('year');
    const month = sp.get('month'); // 1-12
    const concepto = sp.get('concepto');
    const tipo = sp.get('tipo'); // 'ingreso' | 'gasto'

    const where: string[] = [];
    const params: any[] = [];

    if (year) { params.push(Number(year)); where.push(`EXTRACT(YEAR FROM fecha) = $${params.length}`); }
    if (month) { params.push(Number(month)); where.push(`EXTRACT(MONTH FROM fecha) = $${params.length}`); }
    if (concepto) { params.push(`%${concepto}%`); where.push(`concepto ILIKE $${params.length}`); }
    if (tipo && (tipo === 'ingreso' || tipo === 'gasto')) { params.push(tipo); where.push(`tipo = $${params.length}`); }

    const sql = `
      SELECT id, fecha, establecimiento, importe_sin_iva, iva, total, concepto, observaciones, tipo
      FROM invoice
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY fecha DESC
      LIMIT 500
    `;

    const pool = getPool();
    const { rows } = await pool.query(sql, params);

    return NextResponse.json({ ok: true, rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

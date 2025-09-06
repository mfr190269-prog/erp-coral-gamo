'use client';

import { useEffect, useMemo, useState } from 'react';

type Row = {
  id: number;
  fecha: string; // ISO date
  establecimiento: string | null;
  importe_sin_iva: string | number;
  iva: string | number;
  total: string | number;
  concepto: string | null;
  observaciones: string | null;
  tipo: 'ingreso' | 'gasto' | null;
};

const months = [
  { v: '', l: 'Todos' },
  { v: '1', l: 'Enero' },
  { v: '2', l: 'Febrero' },
  { v: '3', l: 'Marzo' },
  { v: '4', l: 'Abril' },
  { v: '5', l: 'Mayo' },
  { v: '6', l: 'Junio' },
  { v: '7', l: 'Julio' },
  { v: '8', l: 'Agosto' },
  { v: '9', l: 'Septiembre' },
  { v: '10', l: 'Octubre' },
  { v: '11', l: 'Noviembre' },
  { v: '12', l: 'Diciembre' },
];

export default function ClientTable() {
  const now = new Date();
  const [year, setYear] = useState<string>(String(now.getFullYear()));
  const [month, setMonth] = useState<string>('');
  const [concepto, setConcepto] = useState<string>('');
  const [tipo, setTipo] = useState<string>(''); // '', 'ingreso', 'gasto'
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (year) params.set('year', year);
      if (month) params.set('month', month);
      if (concepto) params.set('concepto', concepto);
      if (tipo) params.set('tipo', tipo);
      const res = await fetch(`/api/facturas?${params.toString()}`, { cache: 'no-store' });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j?.error || 'Error al cargar');
      setData(j.rows || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  function euro(x: any) {
    const n = typeof x === 'string' ? Number(x) : (x ?? 0);
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0);
  }

  const resume = useMemo(() => {
    const tot = data.reduce((acc, r) => {
      const net = Number(r.importe_sin_iva || 0);
      const iva = Number(r.iva || 0);
      const tot = Number(r.total || 0);
      if (r.tipo === 'ingreso') {
        acc.ingresos.neto += net; acc.ingresos.iva += iva; acc.ingresos.total += tot;
      } else {
        acc.gastos.neto += net; acc.gastos.iva += iva; acc.gastos.total += tot;
      }
      return acc;
    }, { ingresos: { neto: 0, iva: 0, total: 0 }, gastos: { neto: 0, iva: 0, total: 0 } });
    return tot;
  }, [data]);

  function exportCSV() {
    const headers = ['Fecha','Establecimiento','Neto','IVA','Total','Concepto','Observaciones','Tipo'];
    const rows = data.map(r => [
      new Date(r.fecha).toLocaleDateString('es-ES'),
      r.establecimiento ?? '',
      String(r.importe_sin_iva ?? ''),
      String(r.iva ?? ''),
      String(r.total ?? ''),
      r.concepto ?? '',
      r.observaciones ?? '',
      r.tipo ?? ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(x => `"${String(x).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'facturas.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Año</label>
          <input className="border rounded w-full px-2 py-1" value={year} onChange={e=>setYear(e.target.value)} placeholder="2025" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Mes</label>
          <select className="border rounded w-full px-2 py-1" value={month} onChange={e=>setMonth(e.target.value)}>
            {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Concepto</label>
          <input className="border rounded w-full px-2 py-1" value={concepto} onChange={e=>setConcepto(e.target.value)} placeholder="ej. gasolina" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tipo</label>
          <select className="border rounded w-full px-2 py-1" value={tipo} onChange={e=>setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="border rounded px-3 py-2 hover:bg-gray-50">Filtrar</button>
          <button onClick={exportCSV} className="border rounded px-3 py-2 hover:bg-gray-50">Exportar CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Gastos</div>
          <div className="text-lg font-semibold">{euro(resume.gastos.total)}</div>
          <div className="text-xs text-gray-500">Neto {euro(resume.gastos.neto)} · IVA {euro(resume.gastos.iva)}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Ingresos</div>
          <div className="text-lg font-semibold">{euro(resume.ingresos.total)}</div>
          <div className="text-xs text-gray-500">Neto {euro(resume.ingresos.neto)} · IVA {euro(resume.ingresos.iva)}</div>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm border rounded p-2 bg-red-50">{error}</div>}
      {loading ? (
        <div className="text-sm text-gray-600">Cargando…</div>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Establecimiento</th>
                <th className="text-right p-2">Neto</th>
                <th className="text-right p-2">IVA</th>
                <th className="text-right p-2">Total</th>
                <th className="text-left p-2">Concepto</th>
                <th className="text-left p-2">Observaciones</th>
                <th className="text-left p-2">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, idx) => (
                <tr key={r.id ?? idx} className="border-t">
                  <td className="p-2">{new Date(r.fecha).toLocaleDateString('es-ES')}</td>
                  <td className="p-2">{r.establecimiento ?? ''}</td>
                  <td className="p-2 text-right">{euro(r.importe_sin_iva)}</td>
                  <td className="p-2 text-right">{euro(r.iva)}</td>
                  <td className="p-2 text-right font-semibold">{euro(r.total)}</td>
                  <td className="p-2">{r.concepto ?? ''}</td>
                  <td className="p-2">{r.observaciones ?? ''}</td>
                  <td className="p-2">{r.tipo ?? ''}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={8}>Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

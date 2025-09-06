import dynamic from 'next/dynamic';

const ClientTable = dynamic(() => import('./ClientTable'), { ssr: false });

export const metadata = { title: 'Facturas' };

export default function Page() {
  return (
    <main className="border rounded p-4 space-y-3">
      <h2 className="text-xl font-semibold">Facturas</h2>
      <p className="text-sm text-gray-600">
        Filtra por año, mes, concepto y tipo (gasto/ingreso). Exporta a CSV para contabilidad.
      </p>
      <ClientTable />
    </main>
  );
}

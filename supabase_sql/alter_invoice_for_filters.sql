-- Ejecuta esto en Supabase → SQL editor para asegurar columnas necesarias:

ALTER TABLE invoice
  ADD COLUMN IF NOT EXISTS tipo text CHECK (tipo IN ('gasto','ingreso')) DEFAULT 'gasto',
  ADD COLUMN IF NOT EXISTS concepto text,
  ADD COLUMN IF NOT EXISTS observaciones text;

-- Asegura tipos numéricos
ALTER TABLE invoice
  ALTER COLUMN importe_sin_iva TYPE numeric USING importe_sin_iva::numeric,
  ALTER COLUMN iva TYPE numeric USING iva::numeric,
  ALTER COLUMN total TYPE numeric USING total::numeric;

-- Índices útiles para búsquedas por fecha y concepto
CREATE INDEX IF NOT EXISTS idx_invoice_fecha ON invoice (fecha);
CREATE INDEX IF NOT EXISTS idx_invoice_concepto ON invoice (concepto);

-- Datos de prueba
INSERT INTO invoice (fecha, establecimiento, importe_sin_iva, iva, total, concepto, observaciones, tipo)
VALUES 
  (CURRENT_DATE, 'Gasolinera Repsol', 50, 10.5, 60.5, 'gasolina', 'Viaje comercial', 'gasto'),
  (CURRENT_DATE - INTERVAL '2 days', 'Cliente ACME', 1000, 210, 1210, 'venta web', 'Factura 2025-0001', 'ingreso');

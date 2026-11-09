/**
 * CSV exports (18, 18.1, 18.2, FR-041).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Callout, Card, ChipGroup, EmptyState, SelectField, Spinner, TextField } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useExport, type ExportEntity } from '@/hooks/useExport';
import type { CurrencyFilter } from '@/types/api';
import { todayIso } from '@/utils/format';

const ENTITIES: Array<{ value: ExportEntity; label: string; noun: string }> = [
  { value: 'MOVEMENTS', label: 'Movimientos', noun: 'movimientos' },
  { value: 'FIXED_PAYMENTS', label: 'Pagos fijos y vencimientos', noun: 'filas' },
  { value: 'BUDGETS', label: 'Presupuestos', noun: 'límites' },
  { value: 'CASH_FLOW', label: 'Flujo de caja', noun: 'meses' },
];

const CURRENCIES = [
  { value: 'BOTH', label: 'Ambas' },
  { value: 'PEN', label: 'PEN · Soles' },
  { value: 'USD', label: 'USD · Dólares' },
];

/**
 * Previews and downloads the CSV files from {@link useExport}.
 *
 * @example
 * ```tsx
 * <Route path="/exportar" element={<ExportPage />} />
 * ```
 */
export function ExportPage() {
  const { notify } = useToast();
  const year = todayIso().slice(0, 4);
  const [entity, setEntity] = useState<ExportEntity>('MOVEMENTS');
  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(`${year}-12-31`);
  const [currency, setCurrency] = useState<CurrencyFilter>('BOTH');
  const { files, isLoading, error, download, isDownloading } = useExport(entity, from, to, currency);
  const noun = ENTITIES.find((item) => item.value === entity)?.noun ?? 'filas';
  const isEmpty = files !== null && files.every((file) => file.rows === 0);
  const isRangeValid = Boolean(from && to && from <= to);

  const handleDownload = async () => {
    if (files && (await download())) {
      notify({ title: 'Archivo descargado', detail: files.map((file) => `${file.fileName} · ${file.rows} filas`).join(' · ') });
    }
  };

  return (
    <>
      <PageHeader title="Exportar" subtitle="Descarga tu información en CSV para abrirla en cualquier hoja de cálculo." />
      <div className="mb-4 flex flex-col gap-1.5 lg:mb-6">
        <span className="text-label text-content-secondary">¿Qué quieres exportar?</span>
        <ChipGroup label="¿Qué quieres exportar?" options={ENTITIES} value={entity} onChange={setEntity} />
        <p className="text-caption text-content-muted">Pagos fijos y vencimientos se descargan como dos archivos.</p>
      </div>
      <Card title="Filtros" className="mb-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <TextField label="Desde" type="date" value={from} onChange={setFrom} error={isRangeValid ? null : 'La fecha inicial debe ser anterior a la final.'} />
          <TextField label="Hasta" type="date" value={to} onChange={setTo} />
          <SelectField
            label="Moneda"
            value={currency}
            options={CURRENCIES}
            onChange={(value) => setCurrency(value as CurrencyFilter)}
            helper="Con «Ambas», la moneda va en su propia columna y no hay totales que las mezclen."
          />
        </div>
        {isEmpty && (
          <Callout tone="warning" icon="info" className="mt-4" title={`No hay ${entity === 'MOVEMENTS' ? 'movimientos' : 'datos'} en este rango`} text="Descargarás un archivo solo con la fila de encabezados." />
        )}
      </Card>
      <Card title="Vista previa del archivo">
        {isLoading && !files && <Spinner label="Preparando archivo…" />}
        {error && <EmptyState icon="error" title="No pudimos preparar el archivo" text="Revisa el rango de fechas e inténtalo de nuevo." />}
        {files?.map((file) => (
          <div key={file.fileName} className="mb-3 last:mb-0">
            <BreakdownRow label="Archivo" value={<span className="break-all">{file.fileName}</span>} />
            <BreakdownRow label="Formato" value="CSV · UTF-8 · separado por comas" />
            <BreakdownRow label="Filas" value={file.rows === 0 ? 'Solo encabezados' : `${file.rows} ${noun}, sin filas de totales`} />
            <p className="mt-1 text-caption text-content-muted">Columnas: {file.columns.join(', ')}</p>
          </div>
        ))}
      </Card>
      <div className="mt-4 flex justify-end lg:mt-6">
        <Button label="Descargar CSV" icon="download" isLoading={isDownloading} disabled={!files || !isRangeValid} onClick={handleDownload} />
      </div>
    </>
  );
}

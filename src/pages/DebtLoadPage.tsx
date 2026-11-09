/**
 * Debt load series against the threshold (14.2, 14.3, FR-037).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { Badge, BarChart, Button, Callout, Card, ChipGroup, DataTable, EmptyState, Modal, Spinner, TextField, YearChip } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useDebtLoad } from '@/hooks/useDebtLoad';
import { useDebtThreshold } from '@/hooks/useDebtThreshold';
import { PATHS } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import { formatAmount, formatPercent, MONTHS_LONG, todayIso } from '@/utils/format';
import { CURRENCY_OPTIONS } from '@/utils/options';
import { parseAmount } from '@/utils/parse';

/**
 * Shows the series from {@link useDebtLoad} and lets the user change the threshold.
 *
 * @example
 * ```tsx
 * <Route path="/flujo-de-caja/carga-de-deuda" element={<DebtLoadPage />} />
 * ```
 */
export function DebtLoadPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const thisYear = Number(todayIso().slice(0, 4));
  const [year, setYear] = useState(String(thisYear));
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const { threshold, setThreshold, isSaving, error: thresholdError } = useDebtThreshold();
  const { data, isLoading, error } = useDebtLoad(Number(year), currency, threshold);
  const [isThresholdOpen, setIsThresholdOpen] = useState(false);
  const [draft, setDraft] = useState(String(threshold));
  const [draftError, setDraftError] = useState<string | null>(null);
  const months = data?.months ?? [];
  const tableRows = months.filter((month) => month.debtPayments > 0);

  const saveThreshold = async () => {
    const value = parseAmount(draft);
    if (value === null || value < 0.01 || value > 100) {
      setDraftError('Ingresa un porcentaje entre 0.01 % y 100 %.');
      return;
    }
    if (await setThreshold(value)) setIsThresholdOpen(false);
  };

  return (
    <>
      <PageHeader
        breadcrumb="Flujo de caja / Carga de deuda"
        title="Carga de deuda"
        subtitle="Pagos fijos de categoría Deuda ÷ ingresos del mes, comparados con tu umbral."
        onBack={() => navigate(PATHS.cashFlow)}
        actions={<Button label="Cambiar umbral" icon="tune" variant="secondary" onClick={() => { setDraft(String(threshold)); setDraftError(null); setIsThresholdOpen(true); }} />}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        <YearChip title="Elige el año" value={year} onChange={setYear} />
        <ChipGroup label="Moneda" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} className="mx-0 px-0" />
      </div>
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos calcular la carga de deuda" />}
      {data && (
        <>
          <Card title={`Serie de 12 meses · umbral ${formatPercent(data.threshold, 2)}`} className="mb-4">
            <p className="-mt-2 mb-4 text-caption text-content-muted">% de los ingresos del mes</p>
            <BarChart
              label="Carga de deuda por mes"
              threshold={data.threshold}
              emptyText="Sin ingresos"
              data={months.map((month, index) => ({
                label: MONTHS_LONG[index].slice(0, 3),
                value: month.load,
                valueLabel: month.load === null ? undefined : formatPercent(month.load, 2),
                tone: month.overThreshold ? 'danger' : 'success',
              }))}
            />
            <p className="mt-3 mb-4 text-caption text-content-muted">
              Línea roja: tu umbral de {formatPercent(data.threshold, 2)}. En rojo, los meses por encima del umbral; en gris, los meses sin ingresos.
            </p>
            {tableRows.length > 0 ? (
              <DataTable
                caption="Carga de deuda por mes"
                rows={tableRows}
                rowKey={(row) => row.month}
                columns={[
                  { key: 'month', header: 'Mes', render: (row) => MONTHS_LONG[Number(row.month.slice(5, 7)) - 1] },
                  { key: 'debt', header: 'Pagos de deuda', isNumeric: true, render: (row) => formatAmount(row.debtPayments) },
                  { key: 'incomes', header: 'Ingresos', isNumeric: true, render: (row) => formatAmount(row.incomes) },
                  {
                    key: 'load',
                    header: 'Carga',
                    isNumeric: true,
                    render: (row) =>
                      row.load === null ? <Badge label="Sin ingresos" tone="neutral" /> : row.overThreshold ? <Badge label={formatPercent(row.load, 2)} tone="danger" /> : formatPercent(row.load, 2),
                  },
                ]}
              />
            ) : (
              <p className="text-body text-content-secondary">No tienes pagos fijos de categoría Deuda en {currency} este año.</p>
            )}
          </Card>
          <Callout title="Cómo leerlo" text="Solo cuentan los pagos fijos de categoría Deuda; «Consumo en cuotas» no se incluye. Por debajo del umbral es una carga manejable." />
        </>
      )}
      <Modal
        isOpen={isThresholdOpen}
        icon="tune"
        title="Cambiar umbral"
        description="Porcentaje de tus ingresos del mes que consideras una carga de deuda manejable."
        onClose={() => setIsThresholdOpen(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onClick={() => setIsThresholdOpen(false)} />
            <Button label="Guardar umbral" isLoading={isSaving} onClick={saveThreshold} />
          </>
        }
      >
        <TextField label="Umbral (%)" inputMode="decimal" value={draft} onChange={setDraft} helper="Por defecto, 7 %." error={draftError ?? thresholdError} />
      </Modal>
    </>
  );
}

/**
 * Cash flow of a year by currency (14, 14.1, FR-035).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { Button, Card, ChipGroup, DataTable, EmptyState, Spinner, StatCard, YearChip } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCashFlow } from '@/hooks/useCashFlow';
import { PATHS } from '@/navigation/paths';
import type { Currency } from '@/types/api';
import type { CashFlowRow } from '@/types/overview';
import { fromFirstActiveMonth } from '@/utils/cashFlow';
import { cn } from '@/utils/cn';
import { formatAmount, formatMoney, MONTHS_LONG, todayIso } from '@/utils/format';
import { CURRENCY_OPTIONS } from '@/utils/options';

interface ConceptRow {
  key: keyof Pick<CashFlowRow, 'incomes' | 'accountExpenses' | 'fixedPaid' | 'cardPayments' | 'outflows' | 'pendingCommitments' | 'flow' | 'accumulated'>;
  label: string;
  isStrong?: boolean;
}

const CONCEPTS: ConceptRow[] = [
  { key: 'incomes', label: 'Ingresos' },
  { key: 'outflows', label: 'Salidas efectivas', isStrong: true },
  { key: 'accountExpenses', label: 'Gastos desde cuentas' },
  { key: 'fixedPaid', label: 'Pagos fijos pagados' },
  { key: 'cardPayments', label: 'Pagos de tarjeta' },
  { key: 'flow', label: 'Flujo de caja', isStrong: true },
  { key: 'accumulated', label: 'Acumulado', isStrong: true },
  { key: 'pendingCommitments', label: 'Compromisos pendientes' },
];

function cell(value: number) {
  return <span className={cn(value < 0 && 'text-danger')}>{value < 0 ? `(${formatAmount(Math.abs(value))})` : formatAmount(value)}</span>;
}

/**
 * Shows the monthly matrix from {@link useCashFlow}.
 *
 * @example
 * ```tsx
 * <Route path="/flujo-de-caja" element={<CashFlowPage />} />
 * ```
 */
export function CashFlowPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { notify } = useToast();
  const thisYear = Number(todayIso().slice(0, 4));
  const thisMonth = Number(todayIso().slice(5, 7));
  const [year, setYear] = useState(String(thisYear));
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const { data, isLoading, error, exportCsv, isExporting } = useCashFlow(Number(year), currency);
  const money = (value: number) => formatMoney(value, currency);
  const rows = data?.cashFlow.rows ?? [];
  const isCurrentYear = Number(year) === thisYear;
  const anchor = isCurrentYear ? thisMonth : 12;
  const monthName = MONTHS_LONG[anchor - 1].toLowerCase();
  const total = data?.cashFlow.total;
  // The matrix starts at the first month with activity: leading empty months add nothing.
  const visible = fromFirstActiveMonth(rows);

  const handleExport = async () => {
    if (await exportCsv()) notify({ title: 'Archivo descargado', detail: `Flujo de caja ${year} en ${currency}.` });
    else notify({ title: 'No pudimos exportar', detail: 'Inténtalo de nuevo.', tone: 'danger' });
  };

  return (
    <>
      <PageHeader informationTopic="Flujo de caja"
        title="Flujo de caja"
        subtitle={`Ingresos y salidas efectivas, mes a mes, en ${currency === 'PEN' ? 'soles' : 'dólares'}. Los pagos de tarjeta son salidas; los compromisos se muestran por separado.`}
        actions={[
          <Button key="debt" label="Carga de deuda" icon="trending_up" variant="secondary" onClick={() => navigate(PATHS.debtLoad)} />,
          <Button key="csv" label="Exportar CSV" icon="download" variant="soft" isLoading={isExporting} onClick={handleExport} />,
        ]}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        <YearChip title="Elige el año" value={year} onChange={setYear} />
        <ChipGroup label="Moneda" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} className="mx-0 px-0" />
      </div>
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar el flujo de caja" />}
      {data && rows.length > 0 && visible.length === 0 && (
        <EmptyState icon="query_stats" title={`Sin movimientos en ${year}`} text="Registra un ingreso, un gasto o un pago fijo para ver tu flujo de caja." />
      )}
      {data && visible.length > 0 && total && (
        <>
          <div className="mb-4 grid grid-cols-2 items-stretch gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-4">
            <StatCard label={`Flujo acumulado a ${monthName}`} value={money(rows[anchor - 1].accumulated)} detail="Saldo real de cuentas" />
            <StatCard label={`Flujo de ${monthName}`} value={money(rows[anchor - 1].flow)} detail={isCurrentYear ? 'Mes en curso' : 'Último mes del año'} tone={rows[anchor - 1].flow < 0 ? 'danger' : 'success'} />
            <StatCard label="Acumulado proyectado a diciembre" value={money(rows[11].accumulated)} detail="Solo con lo ya registrado" tone="neutral" className="col-span-2 lg:col-span-1" />
          </div>
          <Card title={`Matriz mensual · ${currency} ${year}`}>
            <DataTable
              caption={`Flujo de caja ${year}`}
              isWide
              rows={CONCEPTS}
              rowKey={(row) => row.key}
              rowClassName={(row) => (row.key === 'pendingCommitments' ? 'italic text-content-muted' : row.key === 'flow' ? 'bg-surface-container text-subtitle' : row.isStrong ? 'text-subtitle' : undefined)}
              columns={[
                { key: 'concept', header: 'Concepto', render: (row) => <span className="whitespace-nowrap">{row.label}</span> },
                ...visible.map((month) => ({
                  key: month.month,
                  header: `${MONTHS_LONG[Number(month.month.slice(5, 7)) - 1].slice(0, 3)}${month.projection ? ' · proyección' : ''}`,
                  isNumeric: true,
                  render: (row: ConceptRow) => cell(month[row.key]),
                })),
                { key: 'total', header: 'Total', isNumeric: true, render: (row: ConceptRow) => (row.key === 'accumulated' ? '—' : cell(total[row.key])) },
              ]}
            />
            <p className="mt-3 text-caption text-content-muted">
              {visible.some((month) => month.projection)
                ? `Proyección: los meses posteriores a ${monthName} incluyen vencimientos pendientes y facturaciones proyectadas. `
                : ''}
              Los valores negativos van entre paréntesis.
            </p>
          </Card>
        </>
      )}
    </>
  );
}

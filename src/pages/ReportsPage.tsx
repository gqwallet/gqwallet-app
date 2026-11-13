/**
 * Expense and income reports (16, 16.1, FR-040).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { PageHeader } from '@/components/layout';
import { RankingTable, ShareList } from '@/components/reports';
import { BarChart, Button, Card, ChipGroup, EmptyState, MonthField, SelectField, Spinner, StatCard, type ProgressTone } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useReports, type ReportKind } from '@/hooks/useReports';
import type { Currency } from '@/types/api';
import type { ReportSlice } from '@/types/transaction';
import { formatAmount, formatMoney, formatMonth, MONTHS_LONG, todayIso } from '@/utils/format';
import { CURRENCY_OPTIONS, ESSENTIALITY_LABEL, INCOME_FREQUENCY_LABEL, INCOME_SOURCE_LABEL, INCOME_TYPE_LABEL, MOOD_LABEL } from '@/utils/options';

const ESSENTIAL_TONE: Record<string, ProgressTone> = { True: 'success', False: 'warning', UNKNOWN: 'caution' };
const MOOD_TONE: Record<string, ProgressTone> = {
  HAPPY: 'violet', CONTENT: 'violet', NEUTRAL: 'violet', SAD: 'violet', WORRIED: 'violet', ANXIOUS: 'violet', ANNOYED: 'violet', STRESSED: 'violet', UNKNOWN: 'neutral',
};

function lookup(map: Record<string, string>, fallback = 'Sin dato') {
  return (label: string) => map[label] ?? (label === 'UNKNOWN' ? fallback : label);
}

function monthBars(slices: ReportSlice[], tone: 'primary' | 'success') {
  return slices.map((slice) => ({ label: MONTHS_LONG[Number(slice.label.slice(5, 7)) - 1]?.slice(0, 3) ?? slice.label, value: slice.amount, valueLabel: formatAmount(slice.amount), tone }));
}

/**
 * Shows the report from {@link useReports} for the chosen kind, period and currency.
 *
 * @example
 * ```tsx
 * <Route path="/reportes" element={<ReportsPage />} />
 * ```
 */
export function ReportsPage() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const today = todayIso();
  const year = Number(today.slice(0, 4));
  const [kind, setKind] = useState<ReportKind>('EXPENSE');
  const [period, setPeriod] = useState(String(year));
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const isMonth = period.includes('-');
  const reportPeriod = { year: Number(period.slice(0, 4)), month: isMonth ? Number(period.slice(5, 7)) : undefined, currency };
  const { expense, income, isLoading, error, exportCsv, isExporting } = useReports(kind, reportPeriod);
  const periodText = isMonth ? formatMonth(period, true).toLowerCase() : period;
  const money = (value: number) => formatMoney(value, currency);
  const report = kind === 'EXPENSE' ? expense : income;
  const count = expense?.transactions ?? income?.incomes ?? 0;

  const handleExport = async () => {
    if (await exportCsv()) notify({ title: 'Archivo descargado', detail: `Movimientos de ${periodText} en ${currency}.` });
    else notify({ title: 'No pudimos exportar', detail: 'Inténtalo de nuevo.', tone: 'danger' });
  };

  return (
    <>
      <PageHeader informationTopic="Reportes"
        title="Reportes"
        subtitle={`${kind === 'EXPENSE' ? 'Gastos' : 'Ingresos'} de ${periodText} en ${currency === 'PEN' ? 'soles' : 'dólares'}.`}
        actions={<Button label="Exportar CSV" icon="download" variant="secondary" isLoading={isExporting} onClick={handleExport} />}
      />
      <ChipGroup label="Tipo de reporte" options={[{ value: 'EXPENSE', label: 'Gastos' }, { value: 'INCOME', label: 'Ingresos' }]} value={kind} onChange={setKind} className="mb-4 lg:mb-6" />
      <div className="mb-4 grid grid-cols-2 gap-4 lg:mb-6">
        <MonthField label="Periodo" value={period} allowYear onChange={setPeriod} />
        <SelectField label="Moneda" value={currency} options={CURRENCY_OPTIONS} onChange={(value) => setCurrency(value as Currency)} helper="Obligatoria. Por defecto, tu moneda principal." />
      </div>
      {isLoading && !report && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos generar el reporte" />}
      {report && count === 0 && (
        <Card>
          <EmptyState icon="bar_chart" title={`Sin ${kind === 'EXPENSE' ? 'gastos' : 'ingresos'} en ${periodText}`} text="Cambia el periodo o la moneda, o registra movimientos para ver tu reporte." />
        </Card>
      )}
      {report && count > 0 && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-5 lg:gap-4">
            <StatCard size="report" informationTopic="Total del reporte" label={kind === 'EXPENSE' ? 'Gasto total' : 'Ingreso total'} value={money(report.total)} tone={kind === 'EXPENSE' ? 'danger' : 'success'} />
            <StatCard size="report" informationTopic="Promedio del reporte" label={kind === 'EXPENSE' ? 'Gasto promedio por transacción' : 'Ingreso promedio'} value={money(report.average)} tone="neutral" />
            <StatCard size="report" informationTopic="Máximo del reporte" label={kind === 'EXPENSE' ? 'Gasto máximo' : 'Ingreso máximo'} value={money(report.max)} tone="neutral" />
            <StatCard size="report" informationTopic="Mínimo del reporte" label={kind === 'EXPENSE' ? 'Gasto mínimo' : 'Ingreso mínimo'} value={money(report.min)} tone="neutral" />
            <StatCard size="report" informationTopic="Cantidad del reporte" label={kind === 'EXPENSE' ? 'Número de gastos' : 'Número de ingresos'} value={String(count)} tone="neutral" />
          </div>
          <Card title="Evolución mensual" className="mb-4 lg:mb-6">
            <p className="mb-4 text-caption text-content-muted">Suma de {kind === 'EXPENSE' ? 'gastos' : 'ingresos'} por mes.</p>
            <BarChart caption={`Suma mensual (${currency === 'PEN' ? 'S/' : 'US$'})`} label="Evolución mensual" data={monthBars(report.monthly, kind === 'EXPENSE' ? 'primary' : 'success')} />
          </Card>
          {expense && (
            <>
              <div className="mb-4 grid gap-4 lg:mb-6 lg:grid-cols-2 lg:gap-6">
                <RankingTable title="Top 10 categorías" labelHeader="Categoría" amountHeader="Gasto" slices={expense.topCategories} />
                <RankingTable title="Top 10 comercios" labelHeader="Comercio" amountHeader="Gasto" slices={expense.topMerchants.map((slice) => ({ ...slice, label: slice.label === 'UNKNOWN' ? 'Sin comercio' : slice.label }))} />
              </div>
              <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-6">
                <ShareList title="Por medio de pago" showDonut slices={expense.byPaymentMethod} labelOf={(label) => label} toneOf={() => 'primary'} />
                <ShareList title="Esencial vs. no esencial" showDonut slices={expense.byEssentiality} labelOf={lookup({ True: 'Esencial', False: 'No esencial', UNKNOWN: ESSENTIALITY_LABEL.UNKNOWN })} toneOf={(label) => ESSENTIAL_TONE[label] ?? 'primary'} />
                <ShareList
                  title="Por estado de ánimo"
                  slices={expense.byMood}
                  labelOf={lookup(MOOD_LABEL)}
                  toneOf={(label) => MOOD_TONE[label] ?? 'primary'}
                  note="Cada porcentaje es la participación sobre el gasto total; suman 100 %."
                />
              </div>
            </>
          )}
          {income && (
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
              <RankingTable title="Por categoría" labelHeader="Categoría" amountHeader="Ingreso" slices={income.byCategory} />
              <ShareList informationTopic="Tipo de ingreso en reportes" title="Por tipo" slices={income.byType} labelOf={lookup(INCOME_TYPE_LABEL)} toneOf={() => 'success'} />
              <ShareList title="Por fuente" slices={income.bySource} labelOf={lookup(INCOME_SOURCE_LABEL)} toneOf={() => 'success'} />
              <ShareList title="Por frecuencia" slices={income.byFrequency} labelOf={lookup(INCOME_FREQUENCY_LABEL)} toneOf={() => 'success'} />
            </div>
          )}
        </>
      )}
    </>
  );
}

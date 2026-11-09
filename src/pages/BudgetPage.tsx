/**
 * Budget by month and currency (13 to 13.5, FR-033, FR-034).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { BudgetStateBadge, CopyLimitsModal, LimitModal } from '@/components/budget';
import { PageHeader } from '@/components/layout';
import { Button, Callout, Card, ChipGroup, ChipPicker, DataTable, EmptyState, Spinner, StatCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useBudget } from '@/hooks/useBudget';
import type { Currency } from '@/types/api';
import type { BudgetLine } from '@/types/budget';
import { cn } from '@/utils/cn';
import { formatAmount, formatMoney, formatMonth, formatPercent, monthOf, shiftMonth, todayIso } from '@/utils/format';
import { CURRENCY_OPTIONS } from '@/utils/options';

const TOTAL_ID = 'total';

function amount(value: number | null): string {
  if (value === null) return '—';
  return value < 0 ? `(${formatAmount(Math.abs(value))})` : formatAmount(value);
}

/**
 * Shows the budget table from {@link useBudget} and lets the user define and copy limits.
 *
 * @example
 * ```tsx
 * <Route path="/presupuesto" element={<BudgetPage />} />
 * ```
 */
export function BudgetPage() {
  const { profile } = useAuth();
  const { notify } = useToast();
  const current = monthOf(todayIso());
  const [period, setPeriod] = useState(current);
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const { data, isLoading, error, saveLimit, previewCopy, copyFrom, isSaving } = useBudget(period, currency);
  const [limitCategory, setLimitCategory] = useState<string | null>(null);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const months = Array.from({ length: 15 }, (_, index) => shiftMonth(current, 2 - index)).map((month) => ({ value: month, label: formatMonth(month, true) }));
  const monthName = formatMonth(period).toLowerCase();
  const currencyLabel = CURRENCY_OPTIONS.find((option) => option.value === currency)?.label ?? currency;
  const money = (value: number) => formatMoney(value, currency);
  const status = data?.status;
  const withLimit = status?.lines.filter((line) => line.limit !== null).length ?? 0;
  const usage = status?.totalUsage ?? 0;
  const totalRow: BudgetLine | undefined = status
    ? { categoryId: TOTAL_ID, categoryName: `Total ${monthName}`, limit: status.totalLimit, consumption: status.totalConsumption, balance: status.totalLimit - status.totalConsumption, usage: status.totalUsage, state: 'NORMAL' }
    : undefined;

  const handleCopy = async (fromPeriod: string) => {
    const counts = await previewCopy(fromPeriod);
    const result = await copyFrom(fromPeriod);
    if (result) {
      notify({ title: 'Límites copiados', detail: `${result.created} límites nuevos para ${formatMonth(period, true).toLowerCase()}. Los ${counts.existing} existentes no cambiaron.` });
      setIsCopyOpen(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Presupuesto"
        subtitle={`Límites por categoría para ${formatMonth(period, true).toLowerCase()} en ${currency === 'PEN' ? 'soles' : 'dólares'}.`}
        actions={[
          <Button key="copy" label="Copiar límites" icon="content_copy" variant="secondary" onClick={() => setIsCopyOpen(true)} />,
          <Button key="define" label="Definir límite" icon="add" onClick={() => setLimitCategory('')} />,
        ]}
      />
      <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        <ChipPicker title="Elige el mes" options={months} value={period} onChange={setPeriod} />
        <ChipGroup label="Moneda" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} className="mx-0 px-0" />
      </div>
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar el presupuesto" />}
      {status && withLimit === 0 && status.lines.every((line) => line.state === 'NO_BUDGET') ? (
        <Card>
          <EmptyState
            icon="pie_chart"
            title={`No hay límites en ${currency} para ${monthName}`}
            text={`Define un límite por categoría o copia los de otro mes. Tus límites en ${currency === 'PEN' ? 'dólares' : 'soles'} no se mezclan con estos.`}
            action={<Button label="Definir límite" icon="add" onClick={() => setLimitCategory('')} />}
          />
        </Card>
      ) : (
        status &&
        totalRow && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-4">
              <StatCard label={`Límite total de ${monthName}`} value={money(status.totalLimit)} detail={`${withLimit} ${withLimit === 1 ? "categoría" : "categorías"} con límite`} tone="neutral" />
              <StatCard label={`Consumo de ${monthName}`} value={money(status.totalConsumption)} detail="Incluye pagos fijos con esa categoría" tone="warning" />
              <StatCard
                label="Uso del presupuesto"
                value={formatPercent(usage)}
                detail={`Saldo ${money(status.totalLimit - status.totalConsumption)}`}
                tone={usage > 100 ? 'danger' : usage >= 75 ? 'warning' : 'success'}
                className="col-span-2 lg:col-span-1"
              />
            </div>
            <Card title="Por categoría" className="mb-4">
              <DataTable
                caption={`Presupuesto de ${monthName}`}
                isWide
                rows={status.lines}
                rowKey={(line) => line.categoryId}
                footer={totalRow}
                onRowClick={(line) => setLimitCategory(line.categoryId)}
                columns={[
                  {
                    key: 'category',
                    header: 'Categoría',
                    render: (line) => line.categoryName,
                  },
                  { key: 'limit', header: 'Límite', isNumeric: true, render: (line) => amount(line.limit) },
                  { key: 'consumption', header: 'Consumo', isNumeric: true, render: (line) => formatAmount(line.consumption) },
                  { key: 'balance', header: 'Saldo', isNumeric: true, render: (line) => <span className={cn(line.balance !== null && line.balance < 0 && 'text-danger')}>{amount(line.balance)}</span> },
                  { key: 'usage', header: 'Uso', isNumeric: true, render: (line) => (line.usage === null ? '—' : formatPercent(line.usage)) },
                  { key: 'state', header: 'Estado', isNumeric: true, render: (line) => (line.categoryId === TOTAL_ID ? null : <BudgetStateBadge state={line.state} />) },
                ]}
              />
            </Card>
            <Callout
              title="Cómo leerlo"
              text="Normal: menos de 75 %. Atención: de 75 % a menos de 100 %. Alcanzado: 100 %. Excedido: más de 100 %. Con límite 0 (decidiste no gastar): Sin gasto sin consumo y Excedido desde el primer gasto. Sin límite: Sin presupuesto."
            />
          </>
        )
      )}
      {data && (
        <LimitModal
          isOpen={limitCategory !== null}
          categories={data.categories.map((category) => ({ value: category.id, label: category.name }))}
          categoryId={limitCategory ?? ''}
          limits={Object.fromEntries(Object.values(data.limits).map((budget) => [budget.categoryId, budget.limit]))}
          monthLabel={formatMonth(period, true)}
          currencyLabel={currencyLabel}
          currency={currency}
          isSaving={isSaving}
          onSave={async (categoryId, limit) => {
            const saved = await saveLimit(categoryId, limit);
            if (saved) notify({ title: 'Límite guardado', detail: `${data.categories.find((category) => category.id === categoryId)?.name ?? ''} · ${money(limit)} para ${monthName}.` });
            return saved;
          }}
          onClose={() => setLimitCategory(null)}
        />
      )}
      <CopyLimitsModal
        isOpen={isCopyOpen}
        months={months.filter((option) => option.value !== period)}
        defaultSource={shiftMonth(period, -1)}
        targetLabel={formatMonth(period, true)}
        currencyLabel={currencyLabel}
        monthName={(value) => formatMonth(value).toLowerCase()}
        onPreview={previewCopy}
        isSaving={isSaving}
        onCopy={handleCopy}
        onClose={() => setIsCopyOpen(false)}
      />
    </>
  );
}

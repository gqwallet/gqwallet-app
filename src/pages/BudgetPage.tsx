/**
 * Budget by month and currency (13 to 13.5, FR-033, FR-034).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { BudgetStateBadge, CopyLimitsModal, LimitModal } from '@/components/budget';
import { PageHeader } from '@/components/layout';
import { Button, Callout, Card, ChipGroup, DataTable, EmptyState, MonthChip, Spinner, StatCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useBudget } from '@/hooks/useBudget';
import type { Currency } from '@/types/api';
import type { BudgetLine } from '@/types/budget';
import { cn } from '@/utils/cn';
import { clampMonth } from '@/utils/dateLimits';
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
  const [period, setPeriod] = useState(clampMonth(current));
  const [currency, setCurrency] = useState<Currency>(profile?.preferredCurrency ?? 'PEN');
  const { data, isLoading, error, saveLimit, previewCopy, copyFrom, isSaving } = useBudget(period, currency);
  const [limitCategory, setLimitCategory] = useState<string | null>(null);
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const monthName = formatMonth(period).toLowerCase();
  const currencyLabel = CURRENCY_OPTIONS.find((option) => option.value === currency)?.label ?? currency;
  const money = (value: number) => formatMoney(value, currency);
  const status = data?.status;
  const withLimit = status?.lines.filter((line) => line.limit !== null).length ?? 0;
  const usage = status?.totalUsage ?? 0;
  const totalRow: BudgetLine | undefined = status
    ? { categoryId: TOTAL_ID, categoryName: `Total ${monthName}`, limit: status.totalLimit, consumption: status.totalConsumption, balance: null, usage: null, state: 'NORMAL' }
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
        <MonthChip title="Elige el mes" value={period} onChange={setPeriod} />
        <ChipGroup label="Moneda" options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} className="mx-0 px-0" />
      </div>
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar el presupuesto" />}
      {status && totalRow && <>
            <div className="mb-4 grid grid-cols-2 items-stretch gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
              <StatCard label="Límite total" value={money(status.totalLimit)} detail={`${withLimit} categorías con límite`} tone="neutral" />
              <StatCard label="Gastado con presupuesto" value={money(status.budgetedConsumption)} detail={`Uso ${formatPercent(usage)}`} tone={usage > 100 ? 'danger' : 'warning'} />
              <StatCard label="Gastado sin presupuesto" value={money(status.unbudgetedConsumption)} detail={`${status.lines.filter((line) => line.limit === null).length} categorías`} tone="neutral" />
              <StatCard label="Total gastado" value={money(status.totalConsumption)} detail="Consumos y pagos fijos" tone="warning" />
            </div>
            <Card title="Por categoría" className="mb-4">
              <DataTable
                caption={`Presupuesto de ${monthName}`}
                isWide
                rows={[
                  { categoryId: 'group-budgeted', categoryName: 'Con presupuesto', limit: null, consumption: null, balance: null, usage: null, state: 'NORMAL' },
                  ...status.lines.filter((line) => line.limit !== null),
                  { categoryId: 'subtotal-budgeted', categoryName: 'Subtotal con presupuesto', limit: status.totalLimit, consumption: status.budgetedConsumption, balance: null, usage: status.totalUsage, state: 'NORMAL' },
                  { categoryId: 'group-unbudgeted', categoryName: 'Sin presupuesto', limit: null, consumption: null, balance: null, usage: null, state: 'NO_BUDGET' },
                  ...status.lines.filter((line) => line.limit === null),
                  { categoryId: 'subtotal-unbudgeted', categoryName: 'Subtotal sin presupuesto', limit: null, consumption: status.unbudgetedConsumption, balance: null, usage: null, state: 'NO_BUDGET' },
                ] as Array<Omit<BudgetLine, 'consumption'> & { consumption: number | null }>}
                rowClassName={(line) => line.categoryId.startsWith('group-') ? 'bg-surface-container text-subtitle' : line.categoryId.startsWith('subtotal-') ? 'text-subtitle' : undefined}
                rowKey={(line) => line.categoryId}
                footer={totalRow}
                onRowClick={(line) => { if (status.lines.some((item) => item.categoryId === line.categoryId)) setLimitCategory(line.categoryId); }}
                columns={[
                  {
                    key: 'category',
                    header: 'Categoría',
                    render: (line) => line.categoryName,
                  },
                  { key: 'limit', header: 'Límite', isNumeric: true, render: (line) => amount(line.limit) },
                  { key: 'consumption', header: 'Consumo', isNumeric: true, render: (line) => amount(line.consumption) },
                  { key: 'balance', header: 'Saldo', isNumeric: true, render: (line) => <span className={cn(line.balance !== null && line.balance < 0 && 'text-danger')}>{amount(line.balance)}</span> },
                  { key: 'usage', header: 'Uso', isNumeric: true, render: (line) => (line.usage === null ? '—' : formatPercent(line.usage)) },
                  { key: 'state', header: 'Estado', isNumeric: true, render: (line) => (!status.lines.some((item) => item.categoryId === line.categoryId) ? null : <BudgetStateBadge state={line.state} />) },
                ]}
              />
            </Card>
            <Callout
              title="Cómo leerlo"
              text="Normal: menos de 75 %. Atención: de 75 % a menos de 100 %. Alcanzado: 100 %. Excedido: más de 100 %. Con límite 0 (decidiste no gastar): Sin gasto sin consumo y Excedido desde el primer gasto. Sin límite: Sin presupuesto."
            />
          </>}
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
        defaultSource={clampMonth(shiftMonth(period, -1))}
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

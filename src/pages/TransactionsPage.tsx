/**
 * Movement history (06, 06.1, 06.2, 06.3, 07.4, 08.2).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { HistoryFilterModal, HistoryList, HistoryTotals, type HistoryFilterValues } from '@/components/transactions';
import { Button, Card, Chip, EmptyState, Spinner, TextField, InfiniteScrollSentinel } from '@/components/ui';
import { useCategories } from '@/hooks/useCategories';
import { useInstruments } from '@/hooks/useInstruments';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { PATHS, withId } from '@/navigation/paths';
import type { TransactionFilter } from '@/types/transaction';
import { formatMonth, monthOf, monthRange, todayIso } from '@/utils/format';


function defaults(): HistoryFilterValues {
  const month = monthOf(todayIso());
  const { from, to } = monthRange(month);
  return { from, to, month, currency: '', categoryId: '', instrumentId: '', text: '', nature: 'ALL', essentiality: 'ALL', status: 'ALL' };
}

function toFilter(values: HistoryFilterValues): TransactionFilter {
  const range = values.month ? monthRange(values.month) : { from: values.from, to: values.to };
  return {
    from: range.from || undefined,
    to: range.to || undefined,
    currency: values.currency || undefined,
    categoryId: values.categoryId || undefined,
    instrumentId: values.instrumentId || undefined,
    text: values.text.trim() || undefined,
    nature: values.nature === 'ALL' ? undefined : values.nature,
    essentiality: values.essentiality === 'ALL' ? undefined : values.essentiality,
    status: values.status === 'ALL' ? undefined : values.status,
  };
}

/**
 * Shows the filtered history from {@link useTransactionHistory}.
 *
 * @example
 * ```tsx
 * <Route path="/movimientos" element={<TransactionsPage />} />
 * ```
 */
export function TransactionsPage() {
  const navigate = useNavigate();
  const initial = useMemo(() => defaults(), []);
  const [filters, setFilters] = useState<HistoryFilterValues>(initial);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const monthLabel = filters.month && filters.currency ? formatMonth(filters.month).toLowerCase() : null;
  const { data, isLoading, error, refetch, hasMore, isLoadingMore, loadMore } = useTransactionHistory(toFilter(filters), monthLabel);
  const expense = useCategories('EXPENSE');
  const income = useCategories('INCOME');
  const { instruments } = useInstruments();

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(initial);
  const periodText = filters.month ? formatMonth(filters.month, true) : `${filters.from} – ${filters.to}`;
  const subtitle = isFiltered
    ? `Mostrando ${filters.status === 'VOIDED' ? 'movimientos anulados' : 'movimientos'}${filters.currency ? ` en ${filters.currency}` : ''} ${filters.month ? `de ${periodText.toLowerCase()}` : `entre ${periodText}`}${filters.text ? ` que contienen «${filters.text}»` : ''}.`
    : 'Tu historial ordenado por fecha económica, de la más reciente a la más antigua.';
  const apply = (next: HistoryFilterValues) => {
    setFilters(next);
    setIsFilterOpen(false);
  };
  const clear = () => apply(initial);
  const isEmpty = data !== null && data.days.length === 0;

  return (
    <>
      <PageHeader
        title="Movimientos"
        subtitle={subtitle}
        actions={[
          <Button key="transfer" label="Nueva transferencia" icon="swap_horiz" variant="secondary" onClick={() => navigate(PATHS.newTransfer)} />,
          <Button key="new" label="Nuevo movimiento" icon="add" onClick={() => navigate(PATHS.newTransaction)} />,
        ]}
      />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
          <Chip label={`Mes: ${filters.month ? formatMonth(filters.month, true) : 'Rango'}`} isSelected onClick={() => setIsFilterOpen(true)} />
          <Chip label={`Moneda: ${filters.currency || 'Todas'}`} isSelected onClick={() => setIsFilterOpen(true)} />
          <Chip label="Más filtros" icon="tune" onClick={() => setIsFilterOpen(true)} />
          {isFiltered && <Chip label="Limpiar filtros" icon="close" onClick={clear} />}
        </div>
        {isFiltered && (
          <TextField
            label="Buscar en descripción o comercio"
            placeholder="Buscar…"
            trailingIcon="search"
            value={filters.text}
            onChange={(text) => setFilters((current) => ({ ...current, text }))}
            className="lg:ml-auto lg:w-80 [&>label]:sr-only"
          />
        )}
      </div>
      {data && !isEmpty && <HistoryTotals totals={data.totals} />}
      <Card>
        {isLoading && !data && <Spinner />}
        {error && <EmptyState icon="error" title="No pudimos cargar tus movimientos" action={<Button label="Reintentar" onClick={refetch} />} />}
        {isEmpty &&
          (isFiltered ? (
            <EmptyState
              icon="search_off"
              title="No hay movimientos con estos filtros"
              text="Prueba con otro mes, moneda o texto, o limpia los filtros para ver todo tu historial."
              action={<Button label="Limpiar filtros" variant="secondary" onClick={clear} />}
            />
          ) : (
            <EmptyState
              title="Aún no tienes movimientos"
              text="Registra tu primer ingreso o gasto para empezar tu historial."
              action={<Button label="Registrar movimiento" icon="add" onClick={() => navigate(PATHS.newTransaction)} />}
            />
          ))}
        {data && !isEmpty && (
          <>
            <HistoryList days={data.days} onSelect={(item) => item.type === 'transaction' && navigate(withId(PATHS.transaction, item.id))} />
            <InfiniteScrollSentinel hasMore={hasMore} isLoadingMore={isLoadingMore} loadMore={loadMore} error={Boolean(error)} />
          </>
        )}
      </Card>
      <HistoryFilterModal
        isOpen={isFilterOpen}
        value={filters}
        defaults={initial}
        categories={[...expense.categories, ...income.categories].map((category) => ({ value: category.id, label: category.name }))}
        instruments={[
          ...instruments.accounts.map((account) => ({ value: account.id, label: `${account.alias} · ${account.currency}` })),
          ...instruments.cards.map((card) => ({ value: card.id, label: `${card.name} · ${card.currency}` })),
        ]}
        onApply={apply}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  );
}

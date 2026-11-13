/**
 * Card detail (11.1, 11.6, 11.7): amount due, line usage, current cycle expenses and fixed dates.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PayCardModal, PendingCyclesList, StatementHistoryModal } from '@/components/cards';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Card, EmptyState, ListRow, Spinner, StatCard, InfiniteScrollSentinel } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useCardDetail } from '@/hooks/useCardDetail';
import { useCardPayment } from '@/hooks/useCardPayment';
import { PATHS, withId } from '@/navigation/paths';
import { categoryIcon } from '@/utils/categoryIcons';
import { formatMoney, formatPercent, formatShortDate, formatSignedMoney, parseIsoDate, todayIso } from '@/utils/format';
import { summarizeClosedStatements } from '@/utils/paymentCycles';

/**
 * Shows a card from {@link useCardDetail} and pays it with {@link useCardPayment}.
 *
 * @example
 * ```tsx
 * <Route path="/tarjetas/:id" element={<CardDetailPage />} />
 * ```
 */
export function CardDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data, isLoading, error, refetch, hasMore, isLoadingMore, loadMore, paginationError } = useCardDetail(id);
  const { pay, isSaving, error: payError } = useCardPayment();
  const [selectedClosingDate, setSelectedClosingDate] = useState<string>();
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  if (isLoading && !data) return <Spinner />;
  if (error || !data) return <EmptyState icon="error" title="No encontramos esta tarjeta" action={<Button label="Volver a tarjetas" onClick={() => navigate(PATHS.cards)} />} />;

  const { card, usage, nextBilling, expenses, paymentCycles } = data;
  const money = (value: number) => formatMoney(value, card.currency);
  const oldest = [...paymentCycles].sort((a, b) => a.closingDate.localeCompare(b.closingDate)).find((cycle) => Number(cycle.amountDue) > 0);
  const today = todayIso();
  const { amountDue: billedDue, count: billedCount, overdueCount } = summarizeClosedStatements(paymentCycles, today);
  const openingDebt = card.openingDebts.reduce((sum, debt) => sum + Number(debt.amount), 0);
  const insurance = card.insurancePercentage ?? 0;
  const billingDay = parseIsoDate(card.billingDate).getDate();

  return (
    <>
      <PageHeader
        breadcrumb={`Tarjetas / ${card.name}`}
        title={card.name}
        subtitle={`${card.currency}${insurance > 0 ? ` · Seguro desgravamen ${formatPercent(insurance, 2)}` : ''}`}
        showMobileBreadcrumb
        actions={[
          <Button key="pay" label="Pagar tarjeta" icon="payments" disabled={!oldest} onClick={() => { setSelectedClosingDate(undefined); setIsPayOpen(true); }} />,
        ]}
      />
      <div className="mb-4 grid items-stretch gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-4">
        <StatCard informationTopic="Total a pagar"
          label="Total a pagar"
          value={money(billedDue)}
          detail={billedCount === 0 ? 'Sin pagos pendientes' : `${billedCount} ${billedCount === 1 ? 'facturación' : 'facturaciones'}${overdueCount > 0 ? ` · ${overdueCount} ${overdueCount === 1 ? 'vencida' : 'vencidas'}` : ''}`}
          tone="warning"
          valueSize="large"
        />
        <StatCard informationTopic="Línea utilizada" label="Línea utilizada" value={money(usage.used)} detail={openingDebt > 0 ? `Incluye deuda inicial ${money(openingDebt)}` : 'Deuda pendiente calculada'} tone="neutral" valueSize="large" />
        <StatCard informationTopic="Línea disponible" label="Línea disponible" value={money(usage.available)} detail={`Línea total ${money(usage.creditLine)}${usage.creditBalance > 0 ? ` · saldo a favor ${money(usage.creditBalance)}` : ''}`} tone="success" valueSize="large" />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_436px] lg:gap-6">
        <div className="min-w-0">
          <PendingCyclesList cycles={paymentCycles} currency={card.currency} onPay={(closingDate) => { setSelectedClosingDate(closingDate); setIsPayOpen(true); }} />
        <Card title="Gastos del ciclo actual">
          {expenses.length === 0 ? (
            <p className="mb-2 text-body text-content-secondary">Aún no hay gastos en este ciclo.</p>
          ) : (
            expenses.map((expense) => (
              <ListRow
                key={expense.id}
                icon={categoryIcon(expense.category)}
                title={expense.category}
                detail={[expense.merchant, formatShortDate(expense.date)].filter(Boolean).join(' · ')}
                amount={formatSignedMoney(expense.amount, card.currency, false)}
                amountTone="expense"
                onClick={() => navigate(withId(PATHS.transaction, expense.id))}
              />
            ))
          )}
          <InfiniteScrollSentinel hasMore={hasMore} isLoadingMore={isLoadingMore} loadMore={loadMore} error={Boolean(paginationError)} />
          <div className="mt-2">
            <BreakdownRow label="Gastos del ciclo" value={money(nextBilling.expenses)} />
            {insurance > 0 && <BreakdownRow label={`Seguro desgravamen (${formatPercent(insurance, 2)} sobre los gastos)`} value={money(nextBilling.insuranceCharge)} />}
            {nextBilling.payments > 0 && <BreakdownRow label="Pagos del ciclo" value={`− ${money(nextBilling.payments)}`} />}
            <BreakdownRow label="Total a pagar" value={<span className="text-tertiary">{money(nextBilling.amountDue)}</span>} tone="total" />
          </div>
        </Card>
        </div>
        <div className="flex flex-col gap-4 lg:gap-6">
          <Card title="Fechas fijas" informationTopic="Pago de tarjeta">
            <BreakdownRow label="Facturación" value={`Día ${billingDay} de cada mes`} />
            <BreakdownRow label="Corte" value={card.billingCutoffTime || 'Fin del día'} />
            <BreakdownRow label="Pago" value={`Día ${parseIsoDate(card.paymentDueDate).getDate()} de cada mes`} />
            <BreakdownRow label="Próxima facturación" value={formatShortDate(nextBilling.billingDate, true)} />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button label="Editar" icon="edit" variant="secondary" onClick={() => navigate(withId(PATHS.editCard, card.id))} />
              <Button label="Historial de facturaciones" icon="history" variant="ghost" onClick={() => setIsHistoryOpen(true)} />
            </div>
          </Card>
        </div>
      </div>
      <StatementHistoryModal isOpen={isHistoryOpen} cycles={paymentCycles} currency={card.currency} onClose={() => setIsHistoryOpen(false)} />
      <PayCardModal
        isOpen={isPayOpen}
        cardName={card.name}
        currency={card.currency}
        cycles={paymentCycles}
        initialClosingDate={selectedClosingDate}
        accounts={data.accounts}
        isSaving={isSaving}
        error={payError}
        onClose={() => setIsPayOpen(false)}
        onSubmit={async (values) => {
          if (await pay({ ...values, cardId: card.id, currency: card.currency })) {
            const source = data.accounts.find((account) => account.id === values.sourceAccountId)?.alias ?? '';
            notify({ title: 'Pago de tarjeta registrado', detail: `${money(values.amount)} desde ${source}. Tus gastos del mes no cambian.` });
            setIsPayOpen(false);
            refetch();
          }
        }}
      />
    </>
  );
}

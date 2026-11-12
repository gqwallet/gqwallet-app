/**
 * Card detail (11.1, 11.6, 11.7): amount due, line usage, current cycle expenses and fixed dates.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { InformationButton } from '@/components/ui/InformationButton';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PayCardModal, PendingCyclesList } from '@/components/cards';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Callout, Card, EmptyState, ListRow, Spinner, StatCard, InfiniteScrollSentinel } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useCardDetail } from '@/hooks/useCardDetail';
import { useCardPayment } from '@/hooks/useCardPayment';
import { PATHS, withId } from '@/navigation/paths';
import { categoryIcon } from '@/utils/categoryIcons';
import { formatMoney, formatPercent, formatShortDate, formatSignedMoney, parseIsoDate, todayIso } from '@/utils/format';

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

  if (isLoading && !data) return <Spinner />;
  if (error || !data) return <EmptyState icon="error" title="No encontramos esta tarjeta" action={<Button label="Volver a tarjetas" onClick={() => navigate(PATHS.cards)} />} />;

  const { card, usage, nextBilling, expenses, paymentCycles } = data;
  const money = (value: number) => formatMoney(value, card.currency);
  const oldest = [...paymentCycles].sort((a, b) => a.closingDate.localeCompare(b.closingDate)).find((cycle) => Number(cycle.amountDue) > 0);
  const today = todayIso();
  const billed = paymentCycles.filter((cycle) => cycle.closingDate <= today && Number(cycle.amountDue) > 0);
  const billedDue = billed.reduce((sum, cycle) => sum + Number(cycle.amountDue), 0);
  const overdueCount = billed.filter((cycle) => cycle.status === 'OVERDUE').length;
  const openingDebt = card.openingDebts.reduce((sum, debt) => sum + Number(debt.amount), 0);
  const insurance = card.insurancePercentage ?? 0;
  const billingDay = parseIsoDate(card.billingDate).getDate();

  return (
    <>
      <PageHeader
        breadcrumb={`Tarjetas / ${card.name}`}
        title={card.name}
        subtitle={`${card.currency}${insurance > 0 ? ` · Seguro desgravamen ${formatPercent(insurance, 2)}` : ''}`}
        onBack={() => navigate(PATHS.cards)}
        actions={[
          <Button key="edit" label="Editar" icon="edit" variant="secondary" onClick={() => navigate(withId(PATHS.editCard, card.id))} />,
          <Button key="pay" label="Pagar tarjeta" icon="payments" disabled={!oldest} onClick={() => { setSelectedClosingDate(undefined); setIsPayOpen(true); }} />,
        ]}
      />
      <div className="mb-4 grid grid-cols-2 items-stretch gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-4">
        <StatCard informationTopic="Total a pagar"
          label="Total a pagar"
          value={money(billedDue)}
          detail={billed.length === 0 ? 'Sin pagos pendientes' : `${billed.length} ${billed.length === 1 ? 'facturación' : 'facturaciones'}${overdueCount > 0 ? ` · ${overdueCount} ${overdueCount === 1 ? 'vencida' : 'vencidas'}` : ''}`}
          tone="warning"
        />
        <StatCard informationTopic="Línea utilizada" label="Línea utilizada" value={money(usage.used)} detail="Deuda pendiente calculada" tone="neutral" />
        <StatCard informationTopic="Línea disponible" className="col-span-2 lg:col-span-1" label="Línea disponible" value={money(usage.available)} detail={`Línea total ${money(usage.creditLine)}${usage.creditBalance > 0 ? ` · saldo a favor ${money(usage.creditBalance)}` : ''}`} tone="success" />
      </div>
      <PendingCyclesList cycles={paymentCycles} currency={card.currency} onPay={(closingDate) => { setSelectedClosingDate(closingDate); setIsPayOpen(true); }} />
      <div className="grid gap-4 lg:grid-cols-[1fr_436px] lg:gap-6">
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
        <div className="flex flex-col gap-4 lg:gap-6">
          <InformationButton topic="Pago de tarjeta" />
        <Card title="Fechas fijas">
            <BreakdownRow label="Deuda inicial" value={money(openingDebt)} />
            <BreakdownRow label="Facturación" value={`Día ${billingDay} de cada mes`} />
            <BreakdownRow label="Corte" value={card.billingCutoffTime || 'Fin del día'} />
            <BreakdownRow label="Pago" value={`Día ${parseIsoDate(card.paymentDueDate).getDate()} de cada mes`} />
            <BreakdownRow label="Facturación del ciclo" value={formatShortDate(nextBilling.billingDate, true)} />
          </Card>
          <Callout
            title="Pagar la tarjeta no es un gasto"
            text={`Se registra como transferencia desde una cuenta en ${card.currency}: baja la línea utilizada y tus gastos del mes no cambian.`}
          />
        </div>
      </div>
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

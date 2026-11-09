/**
 * Card detail (11.1, 11.6, 11.7): amount due, line usage, current cycle expenses and fixed dates.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PayCardModal } from '@/components/cards';
import { PageHeader } from '@/components/layout';
import { BreakdownRow, Button, Callout, Card, EmptyState, ListRow, Spinner, StatCard, InfiniteScrollSentinel } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useCardDetail } from '@/hooks/useCardDetail';
import { useCardPayment } from '@/hooks/useCardPayment';
import { PATHS, withId } from '@/navigation/paths';
import { categoryIcon } from '@/utils/categoryIcons';
import { formatMoney, formatPercent, formatShortDate, formatSignedMoney, nextDayOfMonth, parseIsoDate, toIsoDate, todayIso } from '@/utils/format';

function shiftDay(iso: string): string {
  const date = parseIsoDate(iso);
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
}

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
  const [isPayOpen, setIsPayOpen] = useState(false);

  if (isLoading && !data) return <Spinner />;
  if (error || !data) return <EmptyState icon="error" title="No encontramos esta tarjeta" action={<Button label="Volver a tarjetas" onClick={() => navigate(PATHS.cards)} />} />;

  const { card, usage, nextBilling, expenses } = data;
  const money = (value: number) => formatMoney(value, card.currency);
  const insurance = card.insurancePercentage ?? 0;
  const billingDay = parseIsoDate(card.billingDate).getDate();
  // The next billing after today: the projected one when still ahead, otherwise the following month.
  const nextCycle = nextBilling.billingDate > todayIso() ? nextBilling.billingDate : nextDayOfMonth(billingDay, shiftDay(nextBilling.billingDate));

  return (
    <>
      <PageHeader
        breadcrumb={`Tarjetas / ${card.name}`}
        title={card.name}
        subtitle={`${card.currency}${insurance > 0 ? ` · Seguro desgravamen ${formatPercent(insurance, 2)}` : ''}`}
        onBack={() => navigate(PATHS.cards)}
        actions={[
          <Button key="edit" label="Editar" icon="edit" variant="secondary" onClick={() => navigate(withId(PATHS.editCard, card.id))} />,
          <Button key="pay" label="Pagar tarjeta" icon="payments" disabled={nextBilling.amountDue <= 0} onClick={() => setIsPayOpen(true)} />,
        ]}
      />
      <div className="mb-4 grid gap-3 lg:mb-6 lg:grid-cols-3 lg:gap-4">
        <StatCard
          label="Total a pagar"
          value={money(nextBilling.amountDue)}
          detail={`Ciclo ${formatShortDate(nextBilling.cycleStart)} – ${formatShortDate(nextBilling.billingDate)} · paga hasta el ${formatShortDate(nextBilling.paymentDueDate)}`}
          tone="warning"
        />
        <StatCard label="Línea utilizada" value={money(usage.used)} detail={`Consumos ${money(data.consumption)} − pagos ${money(Math.max(0, data.consumption - usage.used))}`} tone="neutral" />
        <StatCard label="Línea disponible" value={money(usage.available)} detail={`Línea total ${money(usage.creditLine)}${usage.creditBalance > 0 ? ` · saldo a favor ${money(usage.creditBalance)}` : ''}`} tone="success" />
      </div>
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
          <Card title="Fechas fijas">
            <BreakdownRow label="Facturación" value={`Día ${billingDay} de cada mes`} />
            <BreakdownRow label="Corte" value={card.billingCutoffTime || 'Fin del día'} />
            <BreakdownRow label="Pago" value={`Día ${parseIsoDate(card.paymentDueDate).getDate()} de cada mes`} />
            <BreakdownRow label="Próxima facturación" value={formatShortDate(nextCycle, true)} />
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
        suggestedAmount={nextBilling.amountDue}
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

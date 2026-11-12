/**
 * Fixed payments: pending dues of the month and one-step payment (12 to 12.6).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '@/components/layout';
import { DueGroups, SettleDueModal } from '@/components/obligations';
import { Button, Card, EmptyState, Spinner, StatCard } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useFixedPayments } from '@/hooks/useFixedPayments';
import { PATHS } from '@/navigation/paths';
import type { PaymentDue, SettleDueInput } from '@/types/obligation';
import { formatMoney, formatWeekdayDate, MONTHS_LONG, todayIso } from '@/utils/format';

/**
 * Shows the pending dues from {@link useFixedPayments} and confirms their payment.
 *
 * @example
 * ```tsx
 * <Route path="/pagos-fijos" element={<FixedPaymentsPage />} />
 * ```
 */
export function FixedPaymentsPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data, isLoading, error, settle, isSettling, settleError, resetSettle, skip, isSkipping, skipError, resetSkip } = useFixedPayments();
  const [selected, setSelected] = useState<PaymentDue | null>(null);
  const today = todayIso();
  const month = MONTHS_LONG[Number(today.slice(5, 7)) - 1].toLowerCase();

  const close = () => {
    setSelected(null);
    resetSettle();
    resetSkip();
  };
  const handleConfirm = async (input: SettleDueInput) => {
    if (!selected || !data) return;
    const paid = await settle(selected, input);
    if (!paid) return;
    const amount = input.paidAmount ?? selected.expectedAmount;
    const category = data.fixedPayments[selected.fixedPaymentId]?.budgetCategoryId;
    const categoryName = category ? data.categoryNames[category] : null;
    notify({
      title: 'Pago registrado',
      detail: `${selected.description} · ${formatMoney(amount, selected.currency)} con ${data.instrumentNames[input.instrumentId] ?? 'tu medio de pago'}.${categoryName ? ` Creamos el gasto en ${categoryName}.` : ''}`,
    });
    close();
  };

  const handleSkip = async () => {
    if (!selected) return;
    if (!await skip(selected)) return;
    notify({ title: 'Vencimiento omitido' });
    close();
  };

  const hasDues = data ? Object.values(data.dues).some((list) => list.length > 0) : false;
  const means = selected && data
    ? [
        ...data.accounts.filter((account) => account.currency === selected.currency).map((account) => ({ kind: 'ACCOUNT' as const, id: account.id, name: account.alias })),
        ...data.cards.filter((card) => card.currency === selected.currency).map((card) => ({ kind: 'CARD' as const, id: card.id, name: card.name })),
      ]
    : [];
  const selectedCategory = selected && data ? data.fixedPayments[selected.fixedPaymentId]?.budgetCategoryId : null;

  return (
    <>
      <PageHeader informationTopic="Pagos fijos"
        title="Pagos fijos"
        subtitle={`Vencimientos pendientes al ${formatWeekdayDate(today).toLowerCase()} ${today.slice(0, 4)}.`}
        actions={[
          <Button key="summary" label="Ver resumen" icon="summarize" variant="secondary" onClick={() => navigate(PATHS.fixedPaymentsSummary)} />,
          <Button key="new" label="Nuevo pago fijo" icon="add" onClick={() => navigate(PATHS.newFixedPayment)} />,
        ]}
      />
      {isLoading && !data && <Spinner />}
      {error && <EmptyState icon="error" title="No pudimos cargar tus pagos fijos" />}
      {data && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:gap-4">
            {data.pending.map((total) => (
              <StatCard informationTopic="Vencimientos pendientes"
                key={total.currency}
                label={`Pendiente en ${month} · ${total.currency}`}
                value={formatMoney(total.amount, total.currency)}
                detail={`${total.count} ${total.count === 1 ? 'vencimiento' : 'vencimientos'}`}
                tone="warning"
              />
            ))}
          </div>
          <Card title="Próximos vencimientos">
            {hasDues ? (
              <>
                <p className="-mt-2 mb-2 text-body-s text-content-secondary">Toca un vencimiento para confirmar su pago en un paso.</p>
                <DueGroups dues={data.dues} today={today} instrumentNames={data.instrumentNames} onSelect={setSelected} />
              </>
            ) : (
              <EmptyState
                icon="event_repeat"
                title="No tienes vencimientos pendientes"
                text="Registra tus servicios, suscripciones o deudas para ver sus vencimientos cada mes."
                action={<Button label="Registrar pago fijo" icon="add" onClick={() => navigate(PATHS.newFixedPayment)} />}
              />
            )}
          </Card>
        </>
      )}
      <SettleDueModal
        due={selected}
        today={today}
        means={means}
        categoryName={selectedCategory && data ? data.categoryNames[selectedCategory] ?? null : null}
        isSaving={isSettling}
        error={settleError}
        onConfirm={handleConfirm}
        isSkipping={isSkipping}
        skipError={skipError}
        onSkip={handleSkip}
        onClose={close}
      />
    </>
  );
}

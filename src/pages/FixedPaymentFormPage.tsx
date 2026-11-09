/**
 * New or edited fixed payment (12.10 to 12.13) with its dues and finish action.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { FixedPaymentForm } from '@/components/obligations';
import { Badge, Button, Callout, Card, EmptyState, ListRow, Modal, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useFixedPaymentForm } from '@/hooks/useFixedPaymentForm';
import { PATHS } from '@/navigation/paths';
import type { RegisterFixedPaymentInput } from '@/types/obligation';
import { formatMoney, formatMonth, formatShortDate, shiftMonth, monthOf, todayIso } from '@/utils/format';
import { FIXED_KIND_ICON, FIXED_KIND_LABEL } from '@/utils/options';

const FORM_ID = 'fixed-payment';

/**
 * Registers or edits a fixed payment through {@link useFixedPaymentForm}.
 *
 * @example
 * ```tsx
 * <Route path="/pagos-fijos/nuevo" element={<FixedPaymentFormPage />} />
 * ```
 */
export function FixedPaymentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { notify } = useToast();
  const { data, isLoading, error, register, update, finish, isSaving, saveError } = useFixedPaymentForm(id);
  const [isFinishOpen, setIsFinishOpen] = useState(false);

  if (isLoading && !data) return <Spinner />;
  if (error || !data || (id && !data.fixedPayment)) return <EmptyState icon="error" title="No pudimos cargar el pago fijo" />;

  const payment = data.fixedPayment;
  const means = [
    ...data.accounts.map((account) => ({ value: `ACCOUNT:${account.id}`, label: `${account.alias} · ${account.currency}`, currency: account.currency })),
    ...data.cards.map((card) => ({ value: `CARD:${card.id}`, label: `${card.name} · ${card.currency}`, currency: card.currency })),
  ];
  const latest = data.dues[0];
  const initialMeans = latest?.usualInstrumentId ? `${latest.usualPaymentMethodKind}:${latest.usualInstrumentId}` : '';
  const names = Object.fromEntries(means.map((option) => [option.value.split(':')[1], option.label.split(' · ')[0]]));

  const handleSubmit = async (input: RegisterFixedPaymentInput) => {
    if (payment) {
      const saved = await update({
        description: input.description,
        budgetCategoryId: input.budgetCategoryId,
        amount: input.amount,
        dueDay: input.dueDay,
        usualPaymentMethodKind: input.usualPaymentMethodKind,
        usualInstrumentId: input.usualInstrumentId,
      });
      if (saved) {
        notify({ title: 'Cambios guardados', detail: `${input.description} se actualizó.` });
        navigate(PATHS.fixedPaymentsSummary);
      }
    } else if (await register(input)) {
      notify({
        title: 'Pago fijo registrado',
        detail: input.startMonth === monthOf(todayIso()) ? `${input.description}: su vencimiento de este mes ya aparece en tus pagos fijos.` : `${input.description}: el primer vencimiento aparecerá en ${formatMonth(input.startMonth, true).toLowerCase()}.`,
      });
      navigate(PATHS.fixedPayments);
    }
  };
  const handleFinish = async () => {
    if (await finish()) {
      notify({ title: 'Pago fijo finalizado', detail: `${payment?.description ?? ''} ya no generará vencimientos.` });
      navigate(PATHS.fixedPaymentsSummary);
    }
  };

  const current = latest?.installment;
  return (
    <>
      <PageHeader
        breadcrumb={payment ? `Pagos fijos / ${payment.description}` : 'Pagos fijos / Nuevo'}
        title={payment ? payment.description : 'Nuevo pago fijo'}
        subtitle={
          payment
            ? `${FIXED_KIND_LABEL[payment.kind]} · ${formatMoney(payment.amount, payment.currency)} al mes${current ? ` · cuota ${current.replace('/', ' de ')}` : ''}`
            : 'Generaremos un vencimiento cada mes mientras esté activo. Si empieza este mes, el primero aparece al guardar.'
        }
        actions={payment && payment.status === 'ACTIVE' ? <Button label="Finalizar" icon="event_busy" variant="danger" onClick={() => setIsFinishOpen(true)} /> : undefined}
      />
      {saveError && <Callout tone="danger" text={saveError} className="mb-4" />}
      <div className={payment ? 'grid gap-4 lg:grid-cols-[1fr_436px] lg:gap-6' : ''}>
        <Card title="Datos del pago fijo">
          <FixedPaymentForm
            id={FORM_ID}
            initial={payment}
            initialMeans={initialMeans}
            categories={data.categories.map((category) => ({ value: category.id, label: category.name }))}
            means={means}
            defaultCurrency={profile?.preferredCurrency ?? 'PEN'}
            today={todayIso()}
            onSubmit={handleSubmit}
          />
          <div className="mt-4 flex flex-col-reverse gap-2 lg:flex-row lg:justify-end">
            <Button label="Cancelar" variant="secondary" onClick={() => navigate(-1)} />
            <Button type="submit" form={FORM_ID} label={payment ? 'Guardar cambios' : 'Guardar pago fijo'} icon="check" isLoading={isSaving && !isFinishOpen} />
          </div>
        </Card>
        {payment && (
          <Card title="Vencimientos">
            {data.dues.length === 0 ? (
              <p className="text-body text-content-secondary">Aún no hay vencimientos generados.</p>
            ) : (
              data.dues.map((due) => (
                <ListRow
                  key={due.id}
                  icon={FIXED_KIND_ICON[payment.kind]}
                  title={due.installment ? `Cuota ${due.installment}` : formatMonth(due.dueDate.slice(0, 7), true)}
                  detail={due.status === 'PAID' ? `Pagado · ${due.usualInstrumentId ? names[due.usualInstrumentId] ?? '' : ''}`.replace(/ · $/, '') : formatShortDate(due.dueDate, true)}
                  badge={<Badge label={due.status === 'PAID' ? 'Pagado' : due.status === 'VOIDED' ? 'Anulado' : 'Pendiente'} tone={due.status === 'PAID' ? 'success' : due.status === 'VOIDED' ? 'neutral' : 'warning'} />}
                  amount={formatMoney(due.paidAmount ?? due.expectedAmount, due.currency)}
                />
              ))
            )}
          </Card>
        )}
      </div>
      <Modal
        isOpen={isFinishOpen}
        icon="event_busy"
        title={`¿Finalizar ${payment?.description ?? ''}?`}
        description={`Dejará de generar vencimientos desde ${formatMonth(shiftMonth(monthOf(todayIso()), 1), true).toLowerCase()}. Los vencimientos pagados se conservan en tu historial.`}
        onClose={() => setIsFinishOpen(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onClick={() => setIsFinishOpen(false)} />
            <Button label="Finalizar pago fijo" variant="danger" isLoading={isSaving} onClick={handleFinish} />
          </>
        }
      />
    </>
  );
}

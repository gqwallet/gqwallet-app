/**
 * Movement detail (08, 08.1): edit any field or void it with a reason (FR-026).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { TransactionForm } from '@/components/transactions';
import { BreakdownRow, Button, Callout, Card, EmptyState, Modal, Spinner, TextField } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { PATHS } from '@/navigation/paths';
import type { RegisterTransactionInput } from '@/types/transaction';
import { formatMoney, formatShortDate, todayIso } from '@/utils/format';

const FORM_ID = 'edit-transaction';

function stamp(instant: string): string {
  const date = new Date(instant);
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return `${formatShortDate(iso, true)} · ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Edits or voids a movement through {@link useTransactionForm}.
 *
 * @example
 * ```tsx
 * <Route path="/movimientos/:id" element={<TransactionDetailPage />} />
 * ```
 */
export function TransactionDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { notify } = useToast();
  const { lookups, transaction, isLoading, loadError, update, voidWithReason, isSaving, saveError, suggestMerchants } = useTransactionForm(id);
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  if (isLoading && !transaction) return <Spinner />;
  if (loadError || !transaction || !lookups) {
    return <EmptyState icon="error" title="No encontramos este movimiento" action={<Button label="Volver a movimientos" onClick={() => navigate(PATHS.transactions)} />} />;
  }

  const isExpense = transaction.nature === 'EXPENSE';
  const word = isExpense ? 'gasto' : 'ingreso';
  const categories = isExpense ? lookups.expenseCategories : lookups.incomeCategories;
  const category = categories.find((item) => item.id === transaction.categoryId)?.name ?? 'Movimiento';
  const isVoided = transaction.status === 'VOIDED';

  const handleSave = async ({ nature: _nature, ...input }: RegisterTransactionInput) => {
    void _nature;
    if (await update(input)) {
      notify({ title: 'Cambios guardados', detail: `${category} · ${formatMoney(input.amount, input.currency)}` });
      navigate(PATHS.transactions);
    }
  };
  const handleVoid = async () => {
    if (!reason.trim()) {
      setReasonError('Obligatorio.');
      return;
    }
    if (await voidWithReason(reason.trim())) {
      notify({ title: `${isExpense ? 'Gasto' : 'Ingreso'} anulado`, detail: `${category} · ${formatMoney(transaction.amount, transaction.currency)} ya no cuenta en tus totales.` });
      navigate(PATHS.transactions);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb="Movimientos / Detalle"
        title={`${category} · ${formatMoney(transaction.amount, transaction.currency)}`}
        subtitle={
          isVoided
            ? `${isExpense ? 'Gasto' : 'Ingreso'} anulado del ${formatShortDate(transaction.economicDate, true)}.`
            : `${isExpense ? 'Gasto' : 'Ingreso'} vigente del ${formatShortDate(transaction.economicDate, true)}. Puedes editar cualquier dato.`
        }
        onBack={() => navigate(PATHS.transactions)}
        actions={
          isVoided
            ? undefined
            : [
                <Button key="void" label="Anular" icon="block" variant="danger" onClick={() => setIsVoidOpen(true)} />,
                <Button key="save" type="submit" form={FORM_ID} label="Guardar cambios" icon="check" isLoading={isSaving && !isVoidOpen} />,
              ]
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_356px] lg:gap-6">
        <TransactionForm
          id={FORM_ID}
          nature={transaction.nature}
          categories={categories}
          accounts={lookups.accounts}
          cards={lookups.cards}
          defaultCurrency={profile?.preferredCurrency ?? 'PEN'}
          today={todayIso()}
          initial={transaction}
          serverError={isVoidOpen ? null : saveError}
          onSubmit={handleSave}
          onSuggestMerchants={suggestMerchants}
          onManageCategories={() => navigate(PATHS.categories)}
        />
        <div className="flex flex-col gap-4">
          <Card title="Registro">
            <BreakdownRow label="Estado" value={<span className={isVoided ? 'text-danger' : 'text-secondary'}>{isVoided ? 'Anulado' : 'Vigente'}</span>} />
            <BreakdownRow label="Fecha de registro" value={stamp(transaction.registeredAt)} />
            <BreakdownRow label="Última modificación" value={transaction.updatedAt ? stamp(transaction.updatedAt) : 'Sin cambios'} />
            {isVoided && transaction.voidReason && <BreakdownRow label="Motivo" value={transaction.voidReason} />}
          </Card>
          <Callout
            title="Anular no borra"
            text="Un movimiento anulado deja de contar en saldos, presupuestos, flujos y reportes, pero sigue en tu historial. Si anulas el pago de un vencimiento, ese vencimiento vuelve a «Pendiente»; si anulas una transferencia, se revierten las dos cuentas."
          />
        </div>
      </div>
      <Modal
        isOpen={isVoidOpen}
        icon="block"
        title={`¿Anular este ${word}?`}
        description="Seguirá visible en tu historial como «Anulado», pero dejará de contar en saldos, presupuestos, flujos y reportes."
        onClose={() => setIsVoidOpen(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onClick={() => setIsVoidOpen(false)} />
            <Button label={`Anular ${word}`} variant="danger" isLoading={isSaving} onClick={handleVoid} />
          </>
        }
      >
        <TextField label="Motivo" value={reason} onChange={setReason} helper="Obligatorio." error={reasonError ?? (isVoidOpen ? saveError : null)} />
      </Modal>
    </>
  );
}

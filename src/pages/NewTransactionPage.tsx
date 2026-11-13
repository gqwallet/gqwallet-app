/**
 * New movement (07 to 07.6): expense or income, with the zero-limit warning (FR-033).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout';
import { TransactionForm } from '@/components/transactions';
import { Button, Chip, EmptyState, Modal, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { PATHS } from '@/navigation/paths';
import type { RegisterTransactionFormInput, TransactionNature } from '@/types/transaction';
import { formatMoney, formatMonth, todayIso } from '@/utils/format';

const FORM_ID = 'new-transaction';

/**
 * Registers a movement through {@link useTransactionForm} and returns to the history.
 *
 * @example
 * ```tsx
 * <Route path="/movimientos/nuevo" element={<NewTransactionPage />} />
 * ```
 */
export function NewTransactionPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { profile } = useAuth();
  const { notify } = useToast();
  const [nature, setNature] = useState<TransactionNature>(params.get('tipo') === 'ingreso' ? 'INCOME' : 'EXPENSE');
  const [pending, setPending] = useState<RegisterTransactionFormInput | null>(null);
  const { lookups, isLoading, loadError, register, isSaving, saveError, findZeroLimit, suggestMerchants } = useTransactionForm();
  const isExpense = nature === 'EXPENSE';
  const categories = lookups ? (isExpense ? lookups.expenseCategories : lookups.incomeCategories) : [];

  const save = async (input: RegisterTransactionFormInput) => {
    const saved = await register(input);
    setPending(null);
    if (!saved) return;
    const category = categories.find((item) => item.id === input.categoryId)?.name ?? '';
    const instrument = lookups?.accounts.find((account) => account.id === input.instrumentId)?.alias ?? lookups?.cards.find((card) => card.id === input.instrumentId)?.name;
    notify({
      title: isExpense ? 'Gasto registrado' : 'Ingreso registrado',
      detail: `${formatMoney(input.amount, input.currency)} en ${category}${instrument ? ` · ${instrument}` : ''}`,
    });
    navigate(PATHS.transactions);
  };

  const handleSubmit = async (input: RegisterTransactionFormInput) => {
    if (isExpense && (await findZeroLimit(input.categoryId, input.currency, input.economicDate))) {
      setPending(input);
      return;
    }
    await save(input);
  };

  const pendingCategory = pending ? categories.find((item) => item.id === pending.categoryId)?.name : '';
  return (
    <>
      <PageHeader
        breadcrumb="Movimientos / Nuevo"
        title="Nuevo movimiento"
      />
      <div className="mb-4 flex flex-col gap-2 lg:mb-6">
        <span className="text-label text-content-secondary">Tipo de movimiento</span>
        <div role="group" aria-label="Tipo de movimiento" className="flex gap-2">
          <Chip label="Gasto" isSelected={isExpense} onClick={() => setNature('EXPENSE')} />
          <Chip label="Ingreso" isSelected={!isExpense} onClick={() => setNature('INCOME')} />
          <Chip label="Transferencia" onClick={() => navigate(PATHS.newTransfer)} />
        </div>
      </div>
      {isLoading && !lookups && <Spinner />}
      {loadError && <EmptyState icon="error" title="No pudimos preparar el formulario" />}
      {lookups && (
        <>
          <TransactionForm
            key={nature}
            id={FORM_ID}
            nature={nature}
            categories={categories}
            accounts={lookups.accounts}
            cards={lookups.cards}
            defaultCurrency={profile?.preferredCurrency ?? 'PEN'}
            today={todayIso()}
            serverError={saveError}
            onSubmit={handleSubmit}
            onSuggestMerchants={suggestMerchants}
            onManageCategories={() => navigate(PATHS.categories)}
          />
          <div className="mt-4 flex flex-col-reverse gap-2 lg:mt-6 lg:flex-row lg:justify-end">
            <Button label="Cancelar" variant="secondary" onClick={() => navigate(-1)} />
            <Button type="submit" form={FORM_ID} label={isExpense ? 'Guardar gasto' : 'Guardar ingreso'} icon="check" isLoading={isSaving} />
          </div>
        </>
      )}
      <Modal
        isOpen={pending !== null}
        icon="block"
        title="¿Registrar igual este gasto?"
        description={
          pending
            ? `Decidiste no gastar en ${pendingCategory} en ${formatMonth(pending.economicDate.slice(0, 7)).toLowerCase()} (límite ${formatMoney(0, pending.currency)}). Si lo registras, la categoría pasará a «Excedido».`
            : undefined
        }
        onClose={() => setPending(null)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onClick={() => setPending(null)} />
            <Button label="Registrar igual" isLoading={isSaving} onClick={() => pending && void save(pending)} />
          </>
        }
      />
    </>
  );
}

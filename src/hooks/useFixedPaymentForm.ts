/**
 * Create, edit and finish a fixed payment (FR-029) with its past dues.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { cardsService } from '@/services/cards.service';
import { obligationsService } from '@/services/obligations.service';
import { transactionsService } from '@/services/transactions.service';
import type { Account } from '@/types/account';
import type { ApiError } from '@/types/api';
import type { Card } from '@/types/card';
import type { FixedPayment, PaymentDue, RegisterFixedPaymentInput, UpdateFixedPaymentInput } from '@/types/obligation';
import type { Category } from '@/types/transaction';
import { shiftMonth, monthOf, monthRange, todayIso } from '@/utils/format';

/** Data of the fixed payment form. */
export interface FixedPaymentFormData {
  /** Fixed payment being edited. */
  fixedPayment: FixedPayment | null;
  /** Its dues of the last twelve months and the current one, newest first. */
  dues: PaymentDue[];
  /** Expense categories for the budget link. */
  categories: Category[];
  /** Active accounts. */
  accounts: Account[];
  /** Cards. */
  cards: Card[];
}

/** Result of {@link useFixedPaymentForm}. */
export interface FixedPaymentFormState {
  /** Loaded data. */
  data: FixedPaymentFormData | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Registers a fixed payment; resolves it or `null`. */
  register: (input: RegisterFixedPaymentInput) => Promise<FixedPayment | null>;
  /** Updates the fixed payment; resolves it or `null`. */
  update: (input: UpdateFixedPaymentInput) => Promise<FixedPayment | null>;
  /** Finishes the fixed payment; resolves it or `null`. */
  finish: () => Promise<FixedPayment | null>;
  /** Whether a write is in flight. */
  isSaving: boolean;
  /** Error of the last write. */
  saveError: string | null;
}

/**
 * Loads the lookups (and the fixed payment when editing) and exposes its write actions.
 *
 * @param id - Fixed payment to edit; omit to create.
 * @returns Data and actions.
 * @example
 * ```ts
 * const { data, register } = useFixedPaymentForm();
 * ```
 */
export function useFixedPaymentForm(id?: string): FixedPaymentFormState {
  const { data, isLoading, error } = useResource(async (signal) => {
    const month = monthOf(todayIso());
    const [fixedPayment, categories, accounts, cards, dues] = await Promise.all([
      id ? obligationsService.get(id, signal) : Promise.resolve(null),
      transactionsService.listCategories('EXPENSE', signal),
      accountsService.list(signal),
      cardsService.list(signal),
      id ? obligationsService.listDues(monthRange(shiftMonth(month, -12)).from, monthRange(month).to, signal) : Promise.resolve([]),
    ]);
    return {
      fixedPayment,
      dues: dues.filter((due) => due.fixedPaymentId === id).sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
      categories: categories.filter((category) => category.status === 'ACTIVE').sort((a, b) => a.name.localeCompare(b.name, 'es')),
      accounts: accounts.filter((account) => account.status === 'ACTIVE'),
      cards,
    };
  }, [id]);
  const write = useMutation((run: () => Promise<FixedPayment>) => run());
  const { submit } = write;
  const register = useCallback((input: RegisterFixedPaymentInput) => submit(() => obligationsService.register(input)), [submit]);
  const update = useCallback((input: UpdateFixedPaymentInput) => (id ? submit(() => obligationsService.update(id, input)) : Promise.resolve(null)), [submit, id]);
  const finish = useCallback(() => (id ? submit(() => obligationsService.finish(id)) : Promise.resolve(null)), [submit, id]);
  return {
    data,
    isLoading,
    error,
    register,
    update,
    finish,
    isSaving: write.isSubmitting,
    saveError: write.error ? 'No guardamos el pago fijo. Corrige los campos marcados para continuar.' : null,
  };
}

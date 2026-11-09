/**
 * Lookups and actions of the movement form (FR-007, FR-008, FR-024 to FR-026, FR-033 warning).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { budgetsService } from '@/services/budgets.service';
import { cardsService } from '@/services/cards.service';
import { transactionsService } from '@/services/transactions.service';
import type { Account } from '@/types/account';
import type { ApiError, Currency } from '@/types/api';
import type { Card } from '@/types/card';
import type { Category, RegisterTransactionInput, Transaction, TransactionInput } from '@/types/transaction';
import { monthOf } from '@/utils/format';

/** Lookups of the form. */
export interface TransactionLookups {
  /** Expense categories. */
  expenseCategories: Category[];
  /** Income categories. */
  incomeCategories: Category[];
  /** Active accounts. */
  accounts: Account[];
  /** Cards. */
  cards: Card[];
}

/** Result of {@link useTransactionForm}. */
export interface TransactionFormState {
  /** Lookups, `null` while loading. */
  lookups: TransactionLookups | null;
  /** Movement being edited, when an id is given. */
  transaction: Transaction | null;
  /** Whether the lookups are loading. */
  isLoading: boolean;
  /** Load error. */
  loadError: ApiError | null;
  /** Registers a movement; resolves it or `null`. */
  register: (input: RegisterTransactionInput) => Promise<Transaction | null>;
  /** Saves an edited movement; resolves it or `null`. */
  update: (input: TransactionInput) => Promise<Transaction | null>;
  /** Voids the movement with a reason; resolves it or `null`. */
  voidWithReason: (reason: string) => Promise<Transaction | null>;
  /** Whether a write is in flight. */
  isSaving: boolean;
  /** Message of the last write error. */
  saveError: string | null;
  /** Returns the zero limit of a category in that month and currency, if any. */
  findZeroLimit: (categoryId: string, currency: Currency, date: string) => Promise<boolean>;
  /** Suggests merchants already used. */
  suggestMerchants: (prefix: string) => Promise<string[]>;
}

// A card expense must name its billing cycle. The backend window is [previous closing, closing), so an expense
// on the closing day already belongs to the next cycle: pick the first closing date strictly after the economic date.
async function cycleFor(input: TransactionInput): Promise<string | null> {
  if (input.paymentMethodKind !== 'CARD' || !input.instrumentId) return null;
  if (input.cycleClosingDate) return input.cycleClosingDate;
  const cycles = [...(await cardsService.listBillingCycles(input.instrumentId))].sort((a, b) => a.closingDate.localeCompare(b.closingDate));
  return (cycles.find((cycle) => cycle.closingDate > input.economicDate) ?? cycles[cycles.length - 1])?.closingDate ?? null;
}

function messageOf(error: ApiError | null): string | null {
  if (!error) return null;
  if (error.status === 422) return 'El medio de pago o la categoría no corresponden a la moneda o al tipo del movimiento. Revisa los datos.';
  if (error.status === 409) return 'Este movimiento ya estaba anulado.';
  return 'No guardamos el movimiento hasta que los datos sean válidos.';
}

/**
 * Loads the form lookups (and the movement when editing) and exposes its write actions.
 *
 * @param transactionId - Movement to edit; omit to create.
 * @returns Lookups, movement and actions.
 * @example
 * ```ts
 * const { lookups, register } = useTransactionForm();
 * ```
 */
export function useTransactionForm(transactionId?: string): TransactionFormState {
  const { data, isLoading, error } = useResource(async (signal) => {
    const [expenseCategories, incomeCategories, accounts, cards, transaction] = await Promise.all([
      transactionsService.listCategories('EXPENSE', signal),
      transactionsService.listCategories('INCOME', signal),
      accountsService.list(signal),
      cardsService.list(signal),
      transactionId ? transactionsService.get(transactionId, signal) : Promise.resolve(null),
    ]);
    const byName = (a: Category, b: Category) => a.name.localeCompare(b.name, 'es');
    return {
      lookups: {
        expenseCategories: [...expenseCategories].sort(byName),
        incomeCategories: [...incomeCategories].sort(byName),
        accounts: accounts.filter((account) => account.status === 'ACTIVE'),
        cards,
      },
      transaction,
    };
  }, [transactionId]);

  const write = useMutation((run: () => Promise<Transaction>) => run());
  const { submit } = write;
  const register = useCallback(
    (input: RegisterTransactionInput) => submit(async () => transactionsService.register({ ...input, cycleClosingDate: await cycleFor(input) })),
    [submit],
  );
  const update = useCallback(
    (input: TransactionInput) =>
      transactionId ? submit(async () => transactionsService.update(transactionId, { ...input, cycleClosingDate: await cycleFor(input) })) : Promise.resolve(null),
    [submit, transactionId],
  );
  const voidWithReason = useCallback(
    (reason: string) => (transactionId ? submit(() => transactionsService.voidTransaction(transactionId, reason)) : Promise.resolve(null)),
    [submit, transactionId],
  );
  const findZeroLimit = useCallback(async (categoryId: string, currency: Currency, date: string) => {
    try {
      const budgets = await budgetsService.list(monthOf(date), currency);
      return budgets.some((budget) => budget.categoryId === categoryId && budget.limit === 0);
    } catch {
      return false;
    }
  }, []);
  const suggestMerchants = useCallback(async (prefix: string) => {
    try {
      return await transactionsService.suggestMerchants(prefix);
    } catch {
      return [];
    }
  }, []);

  return {
    lookups: data?.lookups ?? null,
    transaction: data?.transaction ?? null,
    isLoading,
    loadError: error,
    register,
    update,
    voidWithReason,
    isSaving: write.isSubmitting,
    saveError: messageOf(write.error),
    findZeroLimit,
    suggestMerchants,
  };
}

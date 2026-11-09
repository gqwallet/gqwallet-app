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
import type { Category, RegisterTransactionFormInput, Transaction, TransactionFormInput, TransactionInput } from '@/types/transaction';
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
  register: (input: RegisterTransactionFormInput) => Promise<Transaction | null>;
  /** Saves an edited movement; resolves it or `null`. */
  update: (input: TransactionFormInput) => Promise<Transaction | null>;
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

// Select the first closing date on or after the economic date. Only on the card's billing day,
// a purchase strictly after its optional cut-off skips that day's cycle. Missing times keep that cycle.
async function cycleFor(input: TransactionInput, purchaseTime: string | undefined, cards: Card[]): Promise<string | null> {
  if (input.paymentMethodKind !== 'CARD' || !input.instrumentId) return null;
  if (input.cycleClosingDate) return input.cycleClosingDate;
  const cycles = [...(await cardsService.listBillingCycles(input.instrumentId))].sort((a, b) => a.closingDate.localeCompare(b.closingDate));
  const card = cards.find((item) => item.id === input.instrumentId);
  const afterCutoff = Boolean(card?.billingCutoffTime && purchaseTime && purchaseTime > card.billingCutoffTime
    && Number(input.economicDate.slice(8, 10)) === Number(card.billingDate.slice(8, 10)));
  return (cycles.find((cycle) => afterCutoff ? cycle.closingDate > input.economicDate : cycle.closingDate >= input.economicDate)
    ?? (afterCutoff ? undefined : cycles[cycles.length - 1]))?.closingDate ?? null;
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
    ({ purchaseTime, ...input }: RegisterTransactionFormInput) => submit(async () => transactionsService.register({ ...input, cycleClosingDate: await cycleFor(input, purchaseTime, data?.lookups.cards ?? []) })),
    [submit, data],
  );
  const update = useCallback(
    ({ purchaseTime, ...input }: TransactionFormInput) =>
      transactionId ? submit(async () => transactionsService.update(transactionId, { ...input, cycleClosingDate: await cycleFor(input, purchaseTime, data?.lookups.cards ?? []) })) : Promise.resolve(null),
    [submit, transactionId, data],
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

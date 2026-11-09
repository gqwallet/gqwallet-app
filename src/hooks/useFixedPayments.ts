/**
 * Fixed payments page (FR-030, FR-031): pending dues grouped by urgency, month totals per
 * currency and the one-step payment of a due.
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
import type { ApiError, Currency } from '@/types/api';
import type { Card } from '@/types/card';
import type { FixedPayment, PaymentDue, SettleDueInput, UpcomingDues } from '@/types/obligation';
import { monthOf, monthRange, todayIso } from '@/utils/format';

/** Pending amount of the month in one currency. */
export interface PendingTotal {
  /** Currency. */
  currency: Currency;
  /** Sum of the pending dues of the month. */
  amount: number;
  /** Number of pending dues of the month. */
  count: number;
}

/** Data of the fixed payments page. */
export interface FixedPaymentsData {
  /** Pending dues by urgency. */
  dues: UpcomingDues;
  /** Pending totals of the month per currency. */
  pending: PendingTotal[];
  /** Fixed payments by id. */
  fixedPayments: Record<string, FixedPayment>;
  /** Budget category name by id. */
  categoryNames: Record<string, string>;
  /** Account and card names by id. */
  instrumentNames: Record<string, string>;
  /** Active accounts. */
  accounts: Account[];
  /** Cards. */
  cards: Card[];
}

/** Result of {@link useFixedPayments}. */
export interface FixedPaymentsState {
  /** Loaded data. */
  data: FixedPaymentsData | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Pays a due; resolves the paid due or `null`. */
  settle: (due: PaymentDue, input: SettleDueInput) => Promise<PaymentDue | null>;
  /** Whether a payment is in flight. */
  isSettling: boolean;
  /** Payment error message. */
  settleError: string | null;
  /** Clears the payment error. */
  resetSettle: () => void;
}

/**
 * Loads the pending dues and everything needed to confirm them.
 *
 * @returns Data and the settle action.
 * @example
 * ```ts
 * const { data, settle } = useFixedPayments();
 * ```
 */
export function useFixedPayments(): FixedPaymentsState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const { from, to } = monthRange(monthOf(todayIso()));
    const [dues, monthDues, fixedPayments, categories, accounts, cards] = await Promise.all([
      obligationsService.getUpcoming(signal),
      obligationsService.listDues(from, to, signal),
      obligationsService.list(signal),
      transactionsService.listCategories('EXPENSE', signal),
      accountsService.list(signal),
      cardsService.list(signal),
    ]);
    const pendingOfMonth = monthDues.filter((due) => due.status === 'PENDING');
    const pending = (['PEN', 'USD'] as Currency[]).map((currency) => {
      const list = pendingOfMonth.filter((due) => due.currency === currency);
      return { currency, amount: list.reduce((sum, due) => sum + due.expectedAmount, 0), count: list.length };
    });
    const instrumentNames: Record<string, string> = {};
    accounts.forEach((account) => (instrumentNames[account.id] = account.alias));
    cards.forEach((card) => (instrumentNames[card.id] = card.name));
    return {
      dues,
      pending,
      fixedPayments: Object.fromEntries(fixedPayments.map((payment) => [payment.id, payment])),
      categoryNames: Object.fromEntries(categories.map((category) => [category.id, category.name])),
      instrumentNames,
      accounts: accounts.filter((account) => account.status === 'ACTIVE'),
      cards,
    };
  }, []);

  const write = useMutation(({ due, input }: { due: PaymentDue; input: SettleDueInput }) => obligationsService.settle(due.id, input));
  const { submit } = write;
  const settle = useCallback(
    async (due: PaymentDue, input: SettleDueInput) => {
      const paid = await submit({ due, input });
      if (paid) refetch();
      return paid;
    },
    [submit, refetch],
  );
  return {
    data,
    isLoading,
    error,
    settle,
    isSettling: write.isSubmitting,
    settleError: write.error
      ? write.error.status === 409
        ? 'Este vencimiento ya estaba pagado.'
        : 'Ingresa un monto mayor a cero y un medio de pago de la misma moneda. El vencimiento sigue pendiente.'
      : null,
    resetSettle: write.reset,
  };
}

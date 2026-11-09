/**
 * Transfers between own accounts, goal contributions and card payments (FR-023, FR-028, FR-038).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { cardsService } from '@/services/cards.service';
import { savingsService } from '@/services/savings.service';
import { transactionsService } from '@/services/transactions.service';
import type { Account } from '@/types/account';
import type { ApiError, Currency } from '@/types/api';
import type { Card } from '@/types/card';
import type { SavingsGoal } from '@/types/savings';
import type { TransferKind } from '@/types/transaction';

/** Account with its calculated balance. */
export interface AccountWithBalance extends Account {
  /** Balance at today. */
  balance: number;
}

/** Lookups of the transfer form. */
export interface TransferLookups {
  /** Active accounts with balances. */
  accounts: AccountWithBalance[];
  /** Active goals. */
  goals: SavingsGoal[];
  /** Cards. */
  cards: Card[];
}

/** Values submitted by the transfer form. */
export interface TransferValues {
  /** Optional description, up to 120 characters. */
  description?: string | null;
  /** Kind of transfer. */
  kind: TransferKind;
  /** Source account. */
  sourceAccountId: string;
  /** Target account, goal or card. */
  targetId: string;
  /** Positive amount. */
  amount: number;
  /** Currency of the source. */
  currency: Currency;
  /** Economic date (ISO date). */
  economicDate: string;
}

/** Result of {@link useTransferForm}. */
export interface TransferFormState {
  /** Lookups, `null` while loading. */
  lookups: TransferLookups | null;
  /** Whether lookups are loading. */
  isLoading: boolean;
  /** Load error. */
  loadError: ApiError | null;
  /** Registers the transfer; resolves whether it succeeded. */
  submit: (values: TransferValues) => Promise<boolean>;
  /** Suggested amount for paying a card: amount due of its oldest unpaid cycle. */
  suggestCardPayment: (cardId: string) => Promise<number | null>;
  /** Whether a write is in flight. */
  isSaving: boolean;
  /** Message of the last write error. */
  saveError: string | null;
}

async function oldestUnpaidCycle(cardId: string) {
  const cycles = await cardsService.listPaymentCycles(cardId);
  return [...cycles].sort((a, b) => a.closingDate.localeCompare(b.closingDate)).find((cycle) => cycle.amountDue > 0) ?? null;
}

function messageOf(error: ApiError | null): string | null {
  if (!error) return null;
  if (error.status === 422) return 'No pudimos registrar la transferencia: revisa la moneda, el importe o que la tarjeta tenga un saldo por pagar.';
  return 'No pudimos registrar la transferencia. Revisa los datos e inténtalo de nuevo.';
}

/**
 * Loads accounts with balances, goals and cards, and registers any kind of transfer.
 *
 * @returns Lookups and actions.
 * @example
 * ```ts
 * const { lookups, submit } = useTransferForm();
 * ```
 */
export function useTransferForm(): TransferFormState {
  const { data, isLoading, error } = useResource(async (signal) => {
    const [accounts, goals, cards] = await Promise.all([accountsService.list(signal), savingsService.list(signal), cardsService.list(signal)]);
    const active = accounts.filter((account) => account.status === 'ACTIVE');
    const balances = await Promise.all(active.map((account) => accountsService.getBalance(account.id, undefined, signal)));
    return {
      accounts: active.map((account, index) => ({ ...account, balance: balances[index].balance })),
      goals: goals.filter((goal) => goal.status === 'ACTIVE'),
      cards,
    };
  }, []);

  const write = useMutation(async (values: TransferValues) => {
    if (values.kind === 'GOAL_CONTRIBUTION') {
      await savingsService.contribute(values.targetId, {
        sourceAccountId: values.sourceAccountId,
        amount: values.amount,
        currency: values.currency,
        economicDate: values.economicDate,
        description: values.description?.trim() || null,
      });
      return true;
    }
    const cycle = values.kind === 'CARD_PAYMENT' ? await oldestUnpaidCycle(values.targetId) : null;
    await transactionsService.registerTransfer({ ...values, description: values.description?.trim() || null, cycleClosingDate: cycle?.closingDate ?? null });
    return true;
  });
  const { submit: run } = write;
  const submit = useCallback(async (values: TransferValues) => (await run(values)) === true, [run]);
  const suggestCardPayment = useCallback(async (cardId: string) => {
    try {
      return (await oldestUnpaidCycle(cardId))?.amountDue ?? null;
    } catch {
      return null;
    }
  }, []);
  return { lookups: data, isLoading, loadError: error, submit, suggestCardPayment, isSaving: write.isSubmitting, saveError: messageOf(write.error) };
}

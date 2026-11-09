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
import type { Card, PaymentCycle } from '@/types/card';
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
  /** Explicit billing cycle for a card payment. */
  cycleClosingDate?: string | null;
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
  /** Cycles for the selected card. */
  paymentCycles: PaymentCycle[];
  /** Whether the selected card cycles are loading. */
  cyclesLoading: boolean;
  /** Selected card cycle request failure. */
  cyclesError: ApiError | null;
  /** Lookups, `null` while loading. */
  lookups: TransferLookups | null;
  /** Whether lookups are loading. */
  isLoading: boolean;
  /** Load error. */
  loadError: ApiError | null;
  /** Registers the transfer; resolves whether it succeeded. */
  submit: (values: TransferValues) => Promise<boolean>;
  /** Whether a write is in flight. */
  isSaving: boolean;
  /** Message of the last write error. */
  saveError: string | null;
}

const EMPTY_CYCLES: PaymentCycle[] = [];

function messageOf(error: ApiError | null): string | null {
  if (!error) return null;
  if (error.status === 422) return 'No pudimos registrar la transferencia: revisa la moneda, el importe o que la tarjeta tenga un saldo por pagar.';
  return 'No pudimos registrar la transferencia. Revisa los datos e inténtalo de nuevo.';
}

/**
 * Loads accounts with balances, goals and cards, and registers any kind of transfer.
 *
 * @param cardId - Selected card whose payable cycles should be loaded.
 * @returns Lookups, cycle options and actions.
 * @example
 * ```ts
 * const { lookups, submit } = useTransferForm();
 * ```
 */
export function useTransferForm(cardId?: string): TransferFormState {
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

  const cycles = useResource(cardId ? async (signal) => ({ cardId, cycles: await cardsService.listPaymentCycles(cardId, signal) }) : null, [cardId]);

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
    await transactionsService.registerTransfer({ ...values, description: values.description?.trim() || null, cycleClosingDate: values.kind === 'CARD_PAYMENT' ? values.cycleClosingDate ?? null : null });
    return true;
  });
  const { submit: run } = write;
  const submit = useCallback(async (values: TransferValues) => (await run(values)) === true, [run]);
  return { paymentCycles: cycles.data && cycles.data.cardId === cardId ? cycles.data.cycles : EMPTY_CYCLES, cyclesLoading: cycles.isLoading, cyclesError: cycles.error, lookups: data, isLoading, loadError: error, submit, isSaving: write.isSubmitting, saveError: messageOf(write.error) };
}

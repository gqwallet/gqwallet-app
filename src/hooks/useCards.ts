/**
 * Credit cards with their line usage and amount due (FR-017, FR-022) and card registration (FR-004).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { accountsService } from '@/services/accounts.service';
import { cardsService } from '@/services/cards.service';
import { transactionsService } from '@/services/transactions.service';
import type { Account } from '@/types/account';
import type { ApiError } from '@/types/api';
import type { Card, CreditLineUsage, NextBilling, PaymentCycle, RegisterCardInput, UpdateCardInput } from '@/types/card';

/** Card with its server projections. */
export interface CardSummary {
  /** Card. */
  card: Card;
  /** Line usage. */
  usage: CreditLineUsage;
  /** Next billing projection. */
  nextBilling: NextBilling;
  /** Server payment cycles. */
  paymentCycles: PaymentCycle[];
}

/** Account offered to pay a card, with its balance. */
export interface PayingAccount extends Account {
  /** Balance at today. */
  balance: number;
}

/** Result of {@link useCards}. */
export interface CardsState {
  /** Cards with projections. */
  cards: CardSummary[] | null;
  /** Active accounts with balances, for card payments. */
  accounts: PayingAccount[];
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Reloads. */
  refetch: () => void;
}

/**
 * Loads every card with its usage and next billing, and the accounts that can pay them.
 *
 * @returns Cards, accounts and state.
 * @example
 * ```ts
 * const { cards } = useCards();
 * ```
 */
export function useCards(): CardsState {
  const { data, isLoading, error, refetch } = useResource(async (signal) => {
    const [cards, accounts] = await Promise.all([cardsService.list(signal), accountsService.list(signal)]);
    const active = accounts.filter((account) => account.status === 'ACTIVE');
    const [usages, billings, balances, paymentCycles] = await Promise.all([
      Promise.all(cards.map((card) => cardsService.getCreditLineUsage(card.id, signal))),
      Promise.all(cards.map((card) => cardsService.getNextBilling(card.id, signal))),
      Promise.all(active.map((account) => accountsService.getBalance(account.id, undefined, signal))),
      Promise.all(cards.map((card) => cardsService.listPaymentCycles(card.id, signal))),
    ]);
    return {
      cards: cards.map((card, index) => ({ card, usage: usages[index], nextBilling: billings[index], paymentCycles: paymentCycles[index] })),
      accounts: active.map((account, index) => ({ ...account, balance: balances[index].balance })),
    };
  }, []);
  return { cards: data?.cards ?? null, accounts: data?.accounts ?? [], isLoading, error, refetch };
}

/** Result of {@link useCardWrite}. */
export interface CardWriteState {
  /** Registers a card; resolves it or `null`. */
  register: (input: RegisterCardInput) => Promise<Card | null>;
  /** Updates a card; resolves it or `null`. */
  update: (id: string, input: UpdateCardInput) => Promise<Card | null>;
  /** Deletes a card; resolves whether it succeeded. */
  remove: (id: string) => Promise<boolean>;
  /** Number of movements linked to a card. */
  countMovements: (id: string) => Promise<number>;
  /** Whether a write is in flight. */
  isSaving: boolean;
  /** Message of the last write error. */
  error: string | null;
}

/**
 * Exposes card registration, edition and deletion.
 *
 * @returns Write actions and state.
 * @example
 * ```ts
 * const { register } = useCardWrite();
 * ```
 */
export function useCardWrite(): CardWriteState {
  const write = useMutation((run: () => Promise<Card | true>) => run());
  const { submit } = write;
  const register = useCallback(async (input: RegisterCardInput) => (await submit(() => cardsService.register(input))) as Card | null, [submit]);
  const update = useCallback(async (id: string, input: UpdateCardInput) => (await submit(() => cardsService.update(id, input))) as Card | null, [submit]);
  const remove = useCallback(
    async (id: string) =>
      (await submit(async () => {
        await cardsService.remove(id);
        return true;
      })) !== null,
    [submit],
  );
  const countMovements = useCallback(async (id: string) => {
    try {
      return (await transactionsService.list({ instrumentId: id, size: 1 })).totalElements;
    } catch {
      return 0;
    }
  }, []);
  return {
    register,
    update,
    remove,
    countMovements,
    isSaving: write.isSubmitting,
    error: write.error ? 'No guardamos la tarjeta. Revisa los campos e inténtalo de nuevo.' : null,
  };
}

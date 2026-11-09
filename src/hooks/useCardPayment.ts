/**
 * Pays a card from an account of the same currency (FR-023).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { transactionsService } from '@/services/transactions.service';
import type { Currency } from '@/types/api';

/** Values of a card payment. */
export interface CardPaymentInput {
  /** Card paid. */
  cardId: string;
  /** Confirmed cycle to pay. */
  cycleClosingDate: string;
  /** Paying account. */
  sourceAccountId: string;
  /** Amount. */
  amount: number;
  /** Currency of the line. */
  currency: Currency;
  /** Payment date (ISO date). */
  economicDate: string;
}

/** Result of {@link useCardPayment}. */
export interface CardPaymentState {
  /** Registers the payment; resolves whether it succeeded. */
  pay: (input: CardPaymentInput) => Promise<boolean>;
  /** Whether it is saving. */
  isSaving: boolean;
  /** Error message. */
  error: string | null;
}

/**
 * Registers a card payment as a transfer to the selected cycle.
 *
 * @returns Pay action and state.
 * @example
 * ```ts
 * const { pay } = useCardPayment();
 * ```
 */
export function useCardPayment(): CardPaymentState {
  const { submit, isSubmitting, error } = useMutation(async (input: CardPaymentInput) => {
    return transactionsService.registerTransfer({
      kind: 'CARD_PAYMENT',
      sourceAccountId: input.sourceAccountId,
      targetId: input.cardId,
      amount: input.amount,
      currency: input.currency,
      cycleClosingDate: input.cycleClosingDate,
      economicDate: input.economicDate,
    });
  });
  const pay = useCallback(async (input: CardPaymentInput) => (await submit(input)) !== null, [submit]);
  return {
    pay,
    isSaving: isSubmitting,
    error: error ? 'No registramos el pago: la tarjeta no tiene saldo por pagar o el importe supera el total a pagar.' : null,
  };
}

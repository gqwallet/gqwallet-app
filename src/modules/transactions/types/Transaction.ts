import type { CategoryCode } from '@/shared/domain/categories';

// CARD_PAYMENT settles a card statement: it is the cash outflow that spending on the card
// deliberately does not produce, so it is neither income nor consumption (FR-018).
export type TransactionType = 'INCOME' | 'EXPENSE' | 'CARD_PAYMENT';

// Mirror of the backend TransactionResource.
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: CategoryCode | null; // null on a card payment — settling is not a spending category
  cardId: string | null;
  cycleClosingDate: string | null; // ISO date; the cycle this movement is charged to, FR-018
  description: string | null; // optional free-text note, max 120 chars, FR-007
  registeredAt: string; // ISO instant
}

export interface RegisterTransactionPayload {
  amount: number;
  type: TransactionType;
  category: CategoryCode;
  cardId: string | null;
  cycleClosingDate: string | null; // required whenever cardId is set
  description: string | null;
}

// Mirror of the backend RegisterCardPaymentResource — the card comes from the path.
export interface RegisterCardPaymentPayload {
  amount: number;
  cycleClosingDate: string;
  description: string | null;
}

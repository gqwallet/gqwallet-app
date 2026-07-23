import type { CategoryCode } from '@/shared/domain/categories';

export type TransactionType = 'INCOME' | 'EXPENSE';

// Mirror of the backend TransactionResource.
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: CategoryCode;
  cardId: string | null;
  description: string | null; // optional free-text note, max 120 chars, FR-007
  registeredAt: string; // ISO instant
}

export interface RegisterTransactionPayload {
  amount: number;
  type: TransactionType;
  category: CategoryCode;
  cardId: string | null;
  description: string | null;
}

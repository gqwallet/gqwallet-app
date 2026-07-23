import { httpClient } from '@/shared/http/httpClient';
import { cardsService } from '@/modules/cards/services/cardsService';
import type { CategoryCode } from '@/shared/domain/categories';
import type { Card } from '@/modules/cards/types/Card';
import type { RegisterTransactionPayload, Transaction } from '../types/Transaction';

const BASE = '/transactions';

export const transactionsService = {
  async list(): Promise<Transaction[]> {
    const { data } = await httpClient.get<Transaction[]>(BASE);
    return data;
  },

  async register(payload: RegisterTransactionPayload): Promise<Transaction> {
    const { data } = await httpClient.post<Transaction>(BASE, payload);
    return data;
  },

  // The backend owns the canonical category set (fixed Category enum VO).
  async listCategories(): Promise<CategoryCode[]> {
    const { data } = await httpClient.get<CategoryCode[]>(`${BASE}/categories`);
    return data;
  },

  // Outbound read into cards (qs-vue-frontend module-boundary rule): the "link to card"
  // step needs the user's cards to populate a select, kept here instead of a composable
  // or View reaching into the cards module directly.
  async listCardOptions(): Promise<Card[]> {
    return cardsService.list();
  },

  // UX-only preventive check: the backend is the real enforcer of the credit limit
  // (it re-validates on submit regardless), this just avoids a doomed round trip.
  async getAvailableCredit(cardId: string): Promise<number> {
    const [card, linked] = await Promise.all([
      cardsService.get(cardId),
      cardsService.listLinkedTransactions(cardId),
    ]);
    const alreadyLinked = linked
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    return card.creditLine - alreadyLinked;
  },
};

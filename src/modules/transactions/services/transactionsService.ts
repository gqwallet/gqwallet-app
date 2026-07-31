import { httpClient } from '@/shared/http/httpClient';
import { cardsService } from '@/modules/cards/services/cardsService';
import type { CategoryCode } from '@/shared/domain/categories';
import type { Card } from '@/modules/cards/types/Card';
import type { BillingCycleOption, PaymentCycleOption } from '@/modules/cards/types/NextBilling';
import type {
  RegisterCardPaymentPayload,
  RegisterTransactionPayload,
  Transaction,
} from '../types/Transaction';

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

  // FR-018: settling a statement is a non-CRUD action, so the backend models it as the
  // creation of a card sub-resource. The row it creates is still a Transaction, which is why
  // it lives in this service rather than in cardsService.
  async payCard(cardId: string, payload: RegisterCardPaymentPayload): Promise<Transaction> {
    const { data } = await httpClient.post<Transaction>(`/cards/${cardId}/payments`, payload);
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

  // Same outbound rule: the cycle select in the transaction form needs the card's cycles.
  async listBillingCycles(cardId: string): Promise<BillingCycleOption[]> {
    return cardsService.listBillingCycles(cardId);
  },

  // Same outbound rule: the cycle select in the "pay card" form needs each cycle already
  // priced (FR-019), so it can disable/refresh correctly on selection instead of only ever
  // knowing the currently-open cycle's amount.
  async listPaymentCycles(cardId: string): Promise<PaymentCycleOption[]> {
    return cardsService.listPaymentCycles(cardId);
  },

  // UX-only preventive check: the backend is the real enforcer of the credit limit
  // (it re-validates on submit regardless), this just avoids a doomed round trip.
  // FR-018: payments free the line back up, so they are netted off — mirrors the backend's
  // own arithmetic, which would otherwise report a card as permanently maxed out.
  async getAvailableCredit(cardId: string): Promise<number> {
    const [card, linked] = await Promise.all([
      cardsService.get(cardId),
      cardsService.listLinkedTransactions(cardId),
    ]);
    const outstanding = linked.reduce((sum, t) => {
      if (t.type === 'EXPENSE') return sum + t.amount;
      if (t.type === 'CARD_PAYMENT') return sum - t.amount;
      return sum;
    }, 0);
    return card.creditLine - outstanding;
  },
};

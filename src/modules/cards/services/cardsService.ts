import { httpClient } from '@/shared/http/httpClient';
import { transactionsService } from '@/modules/transactions/services/transactionsService';
import type { Card, RegisterCardPayload, UpdateCardPayload } from '../types/Card';
import type { BillingCycleOption, NextBilling } from '../types/NextBilling';
import type { Transaction } from '@/modules/transactions/types/Transaction';

const BASE = '/cards';

export const cardsService = {
  async list(): Promise<Card[]> {
    const { data } = await httpClient.get<Card[]>(BASE);
    return data;
  },

  async get(cardId: string): Promise<Card> {
    const { data } = await httpClient.get<Card>(`${BASE}/${cardId}`);
    return data;
  },

  async register(payload: RegisterCardPayload): Promise<Card> {
    const { data } = await httpClient.post<Card>(BASE, payload);
    return data;
  },

  async update(cardId: string, payload: UpdateCardPayload): Promise<Card> {
    const { data } = await httpClient.put<Card>(`${BASE}/${cardId}`, payload);
    return data;
  },

  async remove(cardId: string): Promise<void> {
    await httpClient.delete(`${BASE}/${cardId}`);
  },

  // FR-017: the card's next-billing projection (cycle window, expenses, seguro desgravamen
  // and total) — a singleton sub-resource computed server-side, never re-derived here from
  // linked transactions.
  async getNextBilling(cardId: string): Promise<NextBilling> {
    const { data } = await httpClient.get<NextBilling>(`${BASE}/${cardId}/next-billing`);
    return data;
  },

  // FR-018: the cycles this card offers for a new movement — exactly two, computed
  // server-side from the card's cut-off day, never guessed from the raw billingDate here.
  async listBillingCycles(cardId: string): Promise<BillingCycleOption[]> {
    const { data } = await httpClient.get<BillingCycleOption[]>(`${BASE}/${cardId}/billing-cycles`);
    return data;
  },

  // Outbound read into transactions (qs-vue-frontend module-boundary rule): the backend
  // doesn't join a card with its transactions server-side, so this composes them here, in
  // the Model layer, instead of a composable reaching into another module's service.
  async listLinkedTransactions(cardId: string): Promise<Transaction[]> {
    const all = await transactionsService.list();
    return all.filter((t) => t.cardId === cardId);
  },
};

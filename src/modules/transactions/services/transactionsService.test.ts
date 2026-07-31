import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/http/httpClient';
import { cardsService } from '@/modules/cards/services/cardsService';
import { transactionsService } from './transactionsService';
import type { Transaction } from '../types/Transaction';

vi.mock('@/shared/http/httpClient');
vi.mock('@/modules/cards/services/cardsService');

const CARD_ID = 'card-1';

function transaction(partial: Partial<Transaction>): Transaction {
  return {
    id: 'tx',
    amount: 0,
    type: 'EXPENSE',
    category: 'FOOD',
    cardId: CARD_ID,
    cycleClosingDate: '2026-08-28',
    description: null,
    registeredAt: '2026-07-29T00:00:00Z',
    ...partial,
  };
}

describe('transactionsService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('posts a card payment to the card sub-resource', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ data: transaction({ type: 'CARD_PAYMENT' }) } as never);

    await transactionsService.payCard(CARD_ID, {
      amount: 400,
      cycleClosingDate: '2026-08-28',
      description: null,
    });

    expect(httpClient.post).toHaveBeenCalledWith(`/cards/${CARD_ID}/payments`, {
      amount: 400,
      cycleClosingDate: '2026-08-28',
      description: null,
    });
  });

  it('sends the chosen cycle when registering a card expense', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ data: transaction({}) } as never);

    await transactionsService.register({
      amount: 100,
      type: 'EXPENSE',
      category: 'FOOD',
      cardId: CARD_ID,
      cycleClosingDate: '2026-09-28',
      description: null,
    });

    expect(httpClient.post).toHaveBeenCalledWith(
      '/transactions',
      expect.objectContaining({ cycleClosingDate: '2026-09-28' }),
    );
  });

  it('delegates the cycle options to the cards service', async () => {
    const cycles = [{ closingDate: '2026-08-28', paymentDueDate: '2026-09-05' }];
    vi.mocked(cardsService.listBillingCycles).mockResolvedValue(cycles);

    await expect(transactionsService.listBillingCycles(CARD_ID)).resolves.toEqual(cycles);
    expect(cardsService.listBillingCycles).toHaveBeenCalledWith(CARD_ID);
  });

  it('delegates the payment cycle options to the cards service', async () => {
    const cycles = [{ closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 400 }];
    vi.mocked(cardsService.listPaymentCycles).mockResolvedValue(cycles);

    await expect(transactionsService.listPaymentCycles(CARD_ID)).resolves.toEqual(cycles);
    expect(cardsService.listPaymentCycles).toHaveBeenCalledWith(CARD_ID);
  });

  it('frees up available credit once a payment is registered', async () => {
    // 460 charged then 400 paid leaves 60 outstanding against a 500 line.
    vi.mocked(cardsService.get).mockResolvedValue({ creditLine: 500 } as never);
    vi.mocked(cardsService.listLinkedTransactions).mockResolvedValue([
      transaction({ id: 'a', amount: 460, type: 'EXPENSE' }),
      transaction({ id: 'b', amount: 400, type: 'CARD_PAYMENT', category: null }),
    ]);

    await expect(transactionsService.getAvailableCredit(CARD_ID)).resolves.toBe(440);
  });

  it('reports the full line as available when nothing is charged', async () => {
    vi.mocked(cardsService.get).mockResolvedValue({ creditLine: 500 } as never);
    vi.mocked(cardsService.listLinkedTransactions).mockResolvedValue([]);

    await expect(transactionsService.getAvailableCredit(CARD_ID)).resolves.toBe(500);
  });
});

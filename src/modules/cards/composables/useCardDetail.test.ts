import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cardsService } from '../services/cardsService';
import { useCardDetail } from './useCardDetail';
import type { Transaction } from '@/modules/transactions/types/Transaction';

vi.mock('../services/cardsService');

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

describe('useCardDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(cardsService.get).mockResolvedValue({ id: CARD_ID, creditLine: 500 } as never);
    vi.mocked(cardsService.getNextBilling).mockResolvedValue({
      cycleStart: '2026-07-28',
      billingDate: '2026-08-28',
      paymentDueDate: '2026-09-05',
      expenses: 400,
      payments: 400,
      insurancePercentage: null,
      insuranceCharge: 0,
      amountDue: 0,
    });
    vi.mocked(cardsService.listPaymentCycles).mockResolvedValue([]);
  });

  it('draws the linked total down when a payment is linked, instead of inflating it', async () => {
    vi.mocked(cardsService.listLinkedTransactions).mockResolvedValue([
      transaction({ id: 'a', amount: 400, type: 'EXPENSE' }),
      transaction({ id: 'b', amount: 150, type: 'CARD_PAYMENT', category: null }),
    ]);

    const { linkedTotal, fetch } = useCardDetail(CARD_ID);
    await fetch();

    expect(linkedTotal.value).toBe(250);
  });

  it('takes amountDue straight from the server projection, never from the linked rows', async () => {
    vi.mocked(cardsService.listLinkedTransactions).mockResolvedValue([
      transaction({ id: 'a', amount: 400, type: 'EXPENSE' }),
    ]);

    const { amountDue, fetch } = useCardDetail(CARD_ID);
    await fetch();

    // The rows would suggest 400 owed; the server says the cycle is settled.
    expect(amountDue.value).toBe(0);
  });

  // FR-019/FR-021: the current cycle can be fully settled while a later one still owes —
  // the "pay" action must stay available for that later cycle instead of reading amountDue
  // (which only ever reflects the currently-open cycle) in isolation.
  it('reports an outstanding balance from a later cycle even when the current one is settled', async () => {
    vi.mocked(cardsService.listLinkedTransactions).mockResolvedValue([]);
    vi.mocked(cardsService.listPaymentCycles).mockResolvedValue([
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 0 },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05', amountDue: 100.34 },
    ]);

    const { hasOutstandingBalance, fetch } = useCardDetail(CARD_ID);
    await fetch();

    expect(hasOutstandingBalance.value).toBe(true);
  });

  it('reports no outstanding balance when every selectable cycle is settled', async () => {
    vi.mocked(cardsService.listLinkedTransactions).mockResolvedValue([]);
    vi.mocked(cardsService.listPaymentCycles).mockResolvedValue([
      { closingDate: '2026-08-28', paymentDueDate: '2026-09-05', amountDue: 0 },
      { closingDate: '2026-09-28', paymentDueDate: '2026-10-05', amountDue: 0 },
    ]);

    const { hasOutstandingBalance, fetch } = useCardDetail(CARD_ID);
    await fetch();

    expect(hasOutstandingBalance.value).toBe(false);
  });

  it('exposes an error message when the card cannot be loaded', async () => {
    vi.mocked(cardsService.get).mockRejectedValue(new Error('network error'));
    vi.mocked(cardsService.listLinkedTransactions).mockResolvedValue([]);

    const { error, fetch } = useCardDetail(CARD_ID);
    await fetch();

    expect(error.value).toBe('No se pudo cargar la tarjeta');
  });
});

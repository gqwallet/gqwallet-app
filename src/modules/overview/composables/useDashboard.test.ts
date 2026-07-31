import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overviewService } from '../services/overviewService';
import { useDashboard } from './useDashboard';
import type { Transaction } from '@/modules/transactions/types/Transaction';

vi.mock('../services/overviewService');

function transaction(partial: Partial<Transaction>): Transaction {
  return {
    id: 'tx',
    amount: 0,
    type: 'EXPENSE',
    category: 'FOOD',
    cardId: null,
    cycleClosingDate: null,
    description: null,
    registeredAt: '2026-07-29T00:00:00Z',
    ...partial,
  };
}

describe('useDashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(overviewService.getMonthlyIncome).mockResolvedValue(3000);
  });

  it('counts card spending as expense but never as a card payment', async () => {
    vi.mocked(overviewService.getDashboard).mockResolvedValue({ balance: 2600, upcomingCards: [] });
    vi.mocked(overviewService.listTransactions).mockResolvedValue([
      transaction({ id: 'a', amount: 3000, type: 'INCOME', category: 'OTHER' }),
      transaction({ id: 'b', amount: 50, type: 'EXPENSE' }),
      transaction({ id: 'c', amount: 400, type: 'EXPENSE', cardId: 'card-1', cycleClosingDate: '2026-08-28' }),
      transaction({ id: 'd', amount: 400, type: 'CARD_PAYMENT', category: null, cardId: 'card-1' }),
    ]);

    const { totalIncome, totalExpense, fetch } = useDashboard();
    await fetch();

    expect(totalIncome.value).toBe(3000);
    // 50 cash + 400 on the card; the 400 payment is settling, not consuming.
    expect(totalExpense.value).toBe(450);
  });

  it('sums what is still owed across every card', async () => {
    vi.mocked(overviewService.getDashboard).mockResolvedValue({
      balance: 3000,
      upcomingCards: [
        { cardId: 'card-1', name: 'Visa', paymentDueDate: '2026-09-05', color: '#3366cc', amountDue: 400 },
        { cardId: 'card-2', name: 'Amex', paymentDueDate: '2026-09-10', color: '#cc3333', amountDue: 120.5 },
      ],
    });
    vi.mocked(overviewService.listTransactions).mockResolvedValue([]);

    const { totalCardDebt, fetch } = useDashboard();
    await fetch();

    expect(totalCardDebt.value).toBe(520.5);
  });

  it('exposes an error message when the panel cannot be loaded', async () => {
    vi.mocked(overviewService.getDashboard).mockRejectedValue(new Error('network error'));
    vi.mocked(overviewService.listTransactions).mockResolvedValue([]);

    const { error, loading, fetch } = useDashboard();
    await fetch();

    expect(error.value).toBe('No se pudo cargar el panel');
    expect(loading.value).toBe(false);
  });
});

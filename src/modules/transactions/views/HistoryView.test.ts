import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import HistoryView from './HistoryView.vue';
import { useTransactions } from '../composables/useTransactions';
import type { Transaction } from '../types/Transaction';

vi.mock('../composables/useTransactions');
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

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

const ROWS = [
  transaction({ id: 'a', amount: 3000, type: 'INCOME', category: 'OTHER' }),
  transaction({ id: 'b', amount: 50, type: 'EXPENSE' }),
  transaction({ id: 'c', amount: 400, type: 'CARD_PAYMENT', category: null, cardId: 'card-1' }),
];

describe('HistoryView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useTransactions).mockReturnValue({
      transactions: ref(ROWS),
      loading: ref(false),
      error: ref(null),
      fetchTransactions: vi.fn(),
    } as never);
  });

  it('names a card payment instead of falling back to a category', () => {
    render(HistoryView);

    // Row title and type label both say it, so it reads unambiguously.
    expect(screen.getAllByText('Pago de tarjeta').length).toBeGreaterThan(0);
  });

  it('does not paint a card payment with the expense colour', () => {
    render(HistoryView);

    const amount = screen.getByText(/- S\/\. 400/);
    expect(amount).not.toHaveClass('text-expense');
    expect(amount).toHaveClass('text-ink');
  });

  it('isolates payments with its own filter', async () => {
    const user = userEvent.setup();
    render(HistoryView);

    await user.click(screen.getByRole('button', { name: 'Pagos' }));

    expect(screen.getByText(/- S\/\. 400/)).toBeInTheDocument();
    expect(screen.queryByText(/\+ S\/\. 3,000/)).not.toBeInTheDocument();
    expect(screen.queryByText(/- S\/\. 50/)).not.toBeInTheDocument();
  });

  it('keeps card payments out of the expenses filter', async () => {
    const user = userEvent.setup();
    render(HistoryView);

    await user.click(screen.getByRole('button', { name: 'Gastos' }));

    expect(screen.getByText(/- S\/\. 50/)).toBeInTheDocument();
    expect(screen.queryByText(/- S\/\. 400/)).not.toBeInTheDocument();
  });
});

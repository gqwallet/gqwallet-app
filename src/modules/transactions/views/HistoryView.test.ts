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
  const removeTransaction = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useTransactions).mockReturnValue({
      transactions: ref(ROWS),
      loading: ref(false),
      error: ref(null),
      deleteError: ref(null),
      fetchTransactions: vi.fn(),
      removeTransaction,
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

  describe('deleting a movement', () => {
    it('confirms then removes the row that was clicked', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();
      render(HistoryView);

      await user.click(screen.getAllByRole('button', { name: 'Eliminar movimiento' })[0]);

      expect(window.confirm).toHaveBeenCalled();
      expect(removeTransaction).toHaveBeenCalledWith('a');
    });

    it('does nothing when the confirmation is declined', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const user = userEvent.setup();
      render(HistoryView);

      await user.click(screen.getAllByRole('button', { name: 'Eliminar movimiento' })[0]);

      expect(removeTransaction).not.toHaveBeenCalled();
    });

    // FR-021: a CARD_PAYMENT can never be deleted — showing an icon that would always fail
    // serves no one, so only the INCOME and EXPENSE rows (a, b) get one, never the
    // CARD_PAYMENT row (c).
    it('never shows the delete icon on a card payment row', () => {
      render(HistoryView);

      expect(screen.getAllByRole('button', { name: 'Eliminar movimiento' })).toHaveLength(2);
    });

    // FR-021: an expense that already existed when its cycle was paid is frozen too — same
    // reasoning, predicted client-side from data already loaded, no extra fetch.
    it('hides the delete icon on a card expense that predates the payment for its cycle', () => {
      vi.mocked(useTransactions).mockReturnValue({
        transactions: ref([
          transaction({
            id: 'paid-expense', type: 'EXPENSE', cardId: 'card-1', cycleClosingDate: '2026-08-28',
            registeredAt: '2026-08-01T00:00:00Z',
          }),
          transaction({ id: 'open-expense', type: 'EXPENSE', cardId: 'card-1', cycleClosingDate: '2026-09-28' }),
          transaction({
            id: 'payment', type: 'CARD_PAYMENT', category: null, cardId: 'card-1', cycleClosingDate: '2026-08-28',
            registeredAt: '2026-08-02T00:00:00Z',
          }),
        ]),
        loading: ref(false),
        error: ref(null),
        deleteError: ref(null),
        fetchTransactions: vi.fn(),
        removeTransaction,
      } as never);

      render(HistoryView);

      // Only "open-expense" is still eligible — "paid-expense" predates the payment that
      // settled its cycle, "payment" itself is a CARD_PAYMENT.
      expect(screen.getAllByRole('button', { name: 'Eliminar movimiento' })).toHaveLength(1);
    });

    // FR-021: a fresh charge made *after* its cycle was already paid was never part of what
    // that payment covered, so it must stay correctable — not just "cycle has a payment".
    it('still shows the delete icon on a card expense registered after its cycle was paid', () => {
      vi.mocked(useTransactions).mockReturnValue({
        transactions: ref([
          transaction({
            id: 'payment', type: 'CARD_PAYMENT', category: null, cardId: 'card-1', cycleClosingDate: '2026-08-28',
            registeredAt: '2026-08-01T00:00:00Z',
          }),
          transaction({
            id: 'new-mistaken-expense', type: 'EXPENSE', cardId: 'card-1', cycleClosingDate: '2026-08-28',
            registeredAt: '2026-08-02T00:00:00Z',
          }),
        ]),
        loading: ref(false),
        error: ref(null),
        deleteError: ref(null),
        fetchTransactions: vi.fn(),
        removeTransaction,
      } as never);

      render(HistoryView);

      expect(screen.getAllByRole('button', { name: 'Eliminar movimiento' })).toHaveLength(1);
    });
  });
});

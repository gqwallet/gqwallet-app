import { beforeEach, describe, expect, it, vi } from 'vitest';
import { transactionsService } from '../services/transactionsService';
import { useTransactions } from './useTransactions';
import type { Transaction } from '../types/Transaction';

vi.mock('../services/transactionsService');

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

describe('useTransactions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('removeTransaction', () => {
    it('drops the deleted row from the local list on success', async () => {
      vi.mocked(transactionsService.list).mockResolvedValue([
        transaction({ id: 'a' }),
        transaction({ id: 'b' }),
      ]);
      vi.mocked(transactionsService.remove).mockResolvedValue(undefined);

      const { transactions, deleteError, fetchTransactions, removeTransaction } = useTransactions();
      await fetchTransactions();
      await removeTransaction('a');

      expect(transactionsService.remove).toHaveBeenCalledWith('a');
      expect(transactions.value.map((t) => t.id)).toEqual(['b']);
      expect(deleteError.value).toBeNull();
    });

    // FR-021: the composable owns the error — surfaces the backend's own rejection reason
    // (e.g. "a card payment can never be deleted once registered") instead of a generic one.
    it('surfaces the backend rejection reason without touching the local list', async () => {
      vi.mocked(transactionsService.list).mockResolvedValue([transaction({ id: 'a' })]);
      vi.mocked(transactionsService.remove).mockRejectedValue({
        response: { data: 'Cannot delete payment tx: a card payment can never be deleted once registered.' },
      });

      const { transactions, deleteError, fetchTransactions, removeTransaction } = useTransactions();
      await fetchTransactions();
      await removeTransaction('a');

      expect(deleteError.value).toBe('Cannot delete payment tx: a card payment can never be deleted once registered.');
      expect(transactions.value.map((t) => t.id)).toEqual(['a']);
    });

    it('falls back to a generic message when the backend sends no reason', async () => {
      vi.mocked(transactionsService.list).mockResolvedValue([transaction({ id: 'a' })]);
      vi.mocked(transactionsService.remove).mockRejectedValue(new Error('network error'));

      const { deleteError, fetchTransactions, removeTransaction } = useTransactions();
      await fetchTransactions();
      await removeTransaction('a');

      expect(deleteError.value).toBe('No se pudo eliminar el movimiento.');
    });
  });
});

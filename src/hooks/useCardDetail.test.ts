/**
 * Tests of the card detail hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/cards.service', () => ({ cardsService: { listPaymentCycles: vi.fn(() => Promise.resolve([])), listBillingCycles: vi.fn(() => Promise.resolve([])), get: vi.fn(() => Promise.resolve({ id: 'c1', name: 'Visa', bankName: 'BCP', currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null })), getCreditLineUsage: vi.fn(() => Promise.resolve({ used: 0 })), getNextBilling: vi.fn(() => Promise.resolve({ cycleStart: '2026-05-11', billingDate: '2026-06-10' })) } }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([])), list: vi.fn(() => Promise.resolve({ content: [], totals: [], page: 0, size: 1, totalElements: 2, totalPages: 1 })) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])), getBalance: vi.fn(() => Promise.resolve({ accountId: 'a1', currency: 'PEN', cutoff: '2026-06-03', balance: 50, negative: false })) } }));
import { cardsService } from '@/services/cards.service';
import { transactionsService } from '@/services/transactions.service';
import type { Transaction } from '@/types/transaction';
import { useCardDetail } from '@/hooks/useCardDetail';

beforeEach(() => vi.clearAllMocks());

describe('useCardDetail', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useCardDetail('c1'));
    await waitFor(() => expect(result.current.data?.accounts[0].balance).toBe(50));
  });
  it.each(['22:00', null])('shows assigned cycle expenses after the previous closing day with cut-off %s', async (billingCutoffTime) => {
    const base = await cardsService.get('c1');
    vi.mocked(cardsService.get).mockResolvedValueOnce({ ...base, billingCutoffTime });
    const expense: Transaction = {
      id: 'previous-cutoff', nature: 'EXPENSE', amount: 10, currency: 'PEN', categoryId: 'k1',
      economicDate: '2026-05-10', paymentMethodKind: 'CARD', instrumentId: 'c1', cycleClosingDate: '2026-06-10',
      description: null, merchant: null, essentiality: null, mood: null, incomeType: null,
      incomeSource: null, incomeFrequency: null, paymentDueId: null, status: 'ACTIVE', voidReason: null,
      registeredAt: '2026-05-10T23:00:00Z', updatedAt: null,
    };
    vi.mocked(transactionsService.list).mockResolvedValueOnce({ content: [
      expense,
      { ...expense, id: 'current', economicDate: '2026-06-10' },
      { ...expense, id: 'next', economicDate: '2026-06-10', cycleClosingDate: '2026-07-10' },
      { ...expense, id: 'previous', cycleClosingDate: '2026-05-10' },
    ], totals: [], page: 0, size: 20, totalElements: 4, totalPages: 1 });
    const { result } = renderHook(() => useCardDetail('c1'));
    await waitFor(() => expect(result.current.data?.expenses.map((item) => item.id)).toEqual(['previous-cutoff', 'current']));
    expect(transactionsService.list).toHaveBeenLastCalledWith(expect.objectContaining({ from: '2026-05-10', to: '2026-06-10' }), expect.any(AbortSignal));
  });

});

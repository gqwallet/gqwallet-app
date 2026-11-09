/**
 * Tests of the fixed payments hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/obligations.service', () => ({ obligationsService: { getUpcoming: vi.fn(() => Promise.resolve({ overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] })), listDues: vi.fn(() => Promise.resolve([{ currency: 'PEN', status: 'PENDING', expectedAmount: 99 }])), list: vi.fn(() => Promise.resolve([])), settle: vi.fn(() => Promise.resolve({ id: 'd1' })) } }));
import { obligationsService } from '@/services/obligations.service';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([])) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([])) } }));
import { useFixedPayments } from '@/hooks/useFixedPayments';

beforeEach(() => vi.clearAllMocks());

describe('useFixedPayments', () => {
  it('sums the pending dues of the month per currency and settles a due', async () => {
    const { result } = renderHook(() => useFixedPayments());
    await waitFor(() => expect(result.current.data?.pending[0]).toEqual({ currency: 'PEN', amount: 99, count: 1 }));
    await act(async () => { await result.current.settle({ id: 'd1' } as never, { paymentMethodKind: 'ACCOUNT', instrumentId: 'a1', economicDate: '2026-06-03', paidAmount: null }); });
    expect(obligationsService.settle).toHaveBeenCalledWith('d1', expect.objectContaining({ instrumentId: 'a1' }));
  });
});

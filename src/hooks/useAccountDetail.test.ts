/**
 * Tests of the account detail hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/accounts.service', () => ({ accountsService: { get: vi.fn(() => Promise.resolve({ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' })), getBalance: vi.fn(() => Promise.resolve({ balance: 50, negative: false, transfersIn: 200, transfersOut: 250 })), update: vi.fn(() => Promise.resolve({ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' })), deactivate: vi.fn(() => Promise.resolve({ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' })) } }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { list: vi.fn(() => Promise.resolve({ content: [{ id: 't1', nature: 'EXPENSE', amount: 10, currency: 'PEN', categoryId: 'k1', economicDate: '2026-06-03', paymentMethodKind: 'ACCOUNT', instrumentId: 'a1', merchant: 'Tambo', incomeSource: null, paymentDueId: null, status: 'ACTIVE', description: null }], totals: [{ nature: 'EXPENSE', currency: 'PEN', total: 10 }], page: 0, size: 1, totalElements: 1, totalPages: 1 })), listTransfers: vi.fn(() => Promise.resolve({ content: [{ id: 'x1', description: 'Reserva mensual', sourceAccountId: 'a1', targetId: 'a2', amount: 5, status: 'ACTIVE', economicDate: '2026-06-01' }], page: 0, size: 100, totalElements: 1, totalPages: 1 })), listCategories: vi.fn(() => Promise.resolve([])) } }));
import { useAccountDetail } from '@/hooks/useAccountDetail';
import { transactionsService } from '@/services/transactions.service';
import { ApiError, type Page } from '@/types/api';
import type { Transfer } from '@/types/transaction';

beforeEach(() => vi.clearAllMocks());

describe('account scoped transfers', () => {
  it('requests only three own transfers while displaying full server totals', async () => {
    const { result } = renderHook(() => useAccountDetail('a1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.breakdown).toMatchObject({ transfersIn: 200, transfersOut: 250, balance: 50 });
    expect(result.current.data?.recent.find((item) => item.type === 'transfer')?.detail).toBe('Reserva mensual');
    expect(transactionsService.listTransfers).toHaveBeenCalledExactlyOnceWith({ accountId: 'a1', to: expect.any(String), size: 3 }, expect.any(AbortSignal));
  });
  it('does not loop even when more account transfers exist', async () => {
    vi.mocked(transactionsService.listTransfers).mockResolvedValueOnce({ content: [], page: 0, size: 3, totalElements: 201, totalPages: 67 });
    const { result } = renderHook(() => useAccountDetail('a1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(transactionsService.listTransfers).toHaveBeenCalledOnce();
    expect(result.current.data?.breakdown.transfersIn).toBe(200);
  });
  it('exposes a failed scoped request', async () => {
    const error = new ApiError(500);
    vi.mocked(transactionsService.listTransfers).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useAccountDetail('a1'));
    await waitFor(() => expect(result.current.error).toBe(error));
  });
  it('aborts a scoped transfer request on unmount', async () => {
    let resolvePage!: (page: Page<Transfer>) => void;
    vi.mocked(transactionsService.listTransfers).mockReturnValueOnce(new Promise((resolve) => { resolvePage = resolve; }));
    const { unmount } = renderHook(() => useAccountDetail('a1'));
    await waitFor(() => expect(transactionsService.listTransfers).toHaveBeenCalledOnce());
    const signal = vi.mocked(transactionsService.listTransfers).mock.calls[0][1];
    unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => resolvePage({ content: [], page: 0, size: 3, totalElements: 0, totalPages: 0 }));
  });
});

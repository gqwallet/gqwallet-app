/**
 * Tests of the history hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listLedger: vi.fn(), list: vi.fn() } }));
import { act } from '@testing-library/react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { transactionsService } from '@/services/transactions.service';
import type { LedgerEntry } from '@/types/ledger';
const entry: LedgerEntry = { id: 't1', entryType: 'MOVEMENT', nature: 'EXPENSE', transferKind: null, amount: 10, currency: 'PEN', economicDate: '2026-06-03', registeredAt: '2026-06-03T12:00:00Z', title: 'Movilidad', categoryId: 'k1', paymentMethod: { kind: 'ACCOUNT', instrumentId: 'a1', label: 'BCP' }, description: null, merchant: 'Tambo', status: 'ACTIVE' };
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(transactionsService.list).mockResolvedValue({ content: [], totals: [{ nature: 'EXPENSE', currency: 'PEN', total: 2200 }], page: 0, size: 1, totalElements: 22, totalPages: 22 });
});
describe('unified history', () => {
  it('preserves server order and financial totals independently of loaded pages', async () => {
    vi.mocked(transactionsService.listLedger).mockResolvedValueOnce({ content: [entry, { ...entry, id: 'x1', entryType: 'TRANSFER', nature: 'TRANSFER', transferKind: 'ACCOUNT_TO_ACCOUNT', economicDate: '2026-06-01', merchant: null, description: 'Reserva mensual', paymentMethod: { kind: 'ACCOUNT', instrumentId: 'a1', label: 'BCP → Interbank' } }], page: 0, size: 20, totalElements: 22, totalPages: 2 });
    const { result } = renderHook(() => useTransactionHistory({}, null));
    await waitFor(() => expect(result.current.data?.totals).toHaveLength(4));
    expect(result.current.data?.days).toHaveLength(2);
    expect(result.current.data?.days[0].items[0]).toMatchObject({ title: 'Movilidad', detail: 'Tambo · BCP', icon: 'directions_car' });
    expect(result.current.data?.days[1].items[0].detail).toBe('BCP → Interbank · Reserva mensual');
    expect(result.current.data?.totals.find((total) => total.currency === 'PEN' && !total.isIncome)?.total).toBe(2200);
    expect(transactionsService.listLedger).toHaveBeenCalledWith({ page: 0, size: 20 }, expect.any(AbortSignal));
  });
  it('appends page two without duplicates and resets on filters and refresh', async () => {
    vi.mocked(transactionsService.listLedger).mockImplementation(async ({ page = 0 }) => ({ content: page === 0 ? [entry] : [entry, { ...entry, id: 't2' }], page, size: 20, totalElements: 2, totalPages: 2 }));
    const { result, rerender } = renderHook(({ text }) => useTransactionHistory({ text }, null), { initialProps: { text: '' } });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.data?.days[0].items).toHaveLength(2));
    expect(result.current.hasMore).toBe(false);
    rerender({ text: 'Tambo' });
    await waitFor(() => expect(result.current.data?.days[0].items).toHaveLength(1));
    expect(transactionsService.listLedger).toHaveBeenLastCalledWith({ text: 'Tambo', page: 0, size: 20 }, expect.any(AbortSignal));
    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data?.days[0].items).toHaveLength(1);
  });
});

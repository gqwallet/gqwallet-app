/**
 * Tests of the fixed payments hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/obligations.service', () => ({ obligationsService: { getUpcoming: vi.fn(() => Promise.resolve({ overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] })), listDues: vi.fn(() => Promise.resolve([{ currency: 'PEN', status: 'PENDING', expectedAmount: 99 }])), list: vi.fn(() => Promise.resolve([])), settle: vi.fn(() => Promise.resolve({ id: 'd1' })), voidDue: vi.fn() } }));
import { obligationsService } from '@/services/obligations.service';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([])) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([])) } }));
import { useFixedPayments } from '@/hooks/useFixedPayments';
import { ApiError } from '@/types/api';
import type { PaymentDue } from '@/types/obligation';

const due: PaymentDue = {
  id: 'd1', fixedPaymentId: 'f1', description: 'Internet', kind: 'HOUSEHOLD_SERVICES',
  dueDate: '2026-11-20', expectedAmount: 99, paidAmount: null, currency: 'PEN', installment: null,
  usualPaymentMethodKind: null, usualInstrumentId: null, status: 'PENDING',
};

beforeEach(() => vi.clearAllMocks());

describe('useFixedPayments', () => {
  it('sums the pending dues of the month per currency and settles a due', async () => {
    const { result } = renderHook(() => useFixedPayments());
    await waitFor(() => expect(result.current.data?.pending[0]).toEqual({ currency: 'PEN', amount: 99, count: 1 }));
    await act(async () => { await result.current.settle({ id: 'd1' } as never, { paymentMethodKind: 'ACCOUNT', instrumentId: 'a1', economicDate: '2026-06-03', paidAmount: null }); });
    expect(obligationsService.settle).toHaveBeenCalledWith('d1', expect.objectContaining({ instrumentId: 'a1' }));
  });

  it('tracks a skip request and refetches pending dues and totals after success', async () => {
    vi.mocked(obligationsService.getUpcoming).mockResolvedValueOnce({ overdue: [], today: [due], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] });
    let complete!: (value: PaymentDue) => void;
    vi.mocked(obligationsService.voidDue).mockImplementationOnce(() => new Promise((resolve) => { complete = resolve; }));
    const { result } = renderHook(() => useFixedPayments());
    await waitFor(() => expect(result.current.data?.dues.today).toEqual([due]));
    let request!: Promise<PaymentDue | null>;
    act(() => { request = result.current.skip(due); });
    expect(result.current.isSkipping).toBe(true);
    expect(obligationsService.voidDue).toHaveBeenCalledWith('d1');
    expect(obligationsService.getUpcoming).toHaveBeenCalledTimes(1);
    const voided: PaymentDue = { ...due, status: 'VOIDED' };
    vi.mocked(obligationsService.listDues).mockResolvedValueOnce([voided]);
    await act(async () => { complete(voided); expect(await request).toEqual(voided); });
    await waitFor(() => expect(result.current.data?.dues.today).toEqual([]));
    expect(result.current.data?.pending[0]).toEqual({ currency: 'PEN', amount: 0, count: 0 });
    expect(result.current.isSkipping).toBe(false);
    expect(result.current.skipError).toBeNull();
    expect(obligationsService.getUpcoming).toHaveBeenCalledTimes(2);
    expect(obligationsService.listDues).toHaveBeenCalledTimes(2);
    expect(obligationsService.settle).not.toHaveBeenCalled();
  });

  it.each([409, 500])('keeps dues unchanged after a failed skip (%s) and resets the error', async (status) => {
    vi.mocked(obligationsService.voidDue).mockRejectedValueOnce(new ApiError(status));
    const { result } = renderHook(() => useFixedPayments());
    await waitFor(() => expect(result.current.data).not.toBeNull());
    const original = result.current.data;
    await act(async () => { expect(await result.current.skip(due)).toBeNull(); });
    expect(result.current.skipError).toBe(status === 409
      ? 'Este vencimiento ya no está pendiente. Actualiza la página para ver su estado.'
      : 'No pudimos omitir el vencimiento. Inténtalo de nuevo.');
    expect(result.current.isSkipping).toBe(false);
    expect(result.current.settleError).toBeNull();
    expect(result.current.data).toBe(original);
    expect(obligationsService.getUpcoming).toHaveBeenCalledTimes(1);
    act(() => result.current.resetSkip());
    expect(result.current.skipError).toBeNull();
  });

  it('excludes paid and voided dues from pending totals', async () => {
    vi.mocked(obligationsService.listDues).mockResolvedValueOnce([
      due, { ...due, id: 'd2', status: 'PAID' }, { ...due, id: 'd3', status: 'VOIDED' },
    ]);
    const { result } = renderHook(() => useFixedPayments());
    await waitFor(() => expect(result.current.data?.pending[0]).toEqual({ currency: 'PEN', amount: 99, count: 1 }));
  });
});

/**
 * Tests of the transfer form hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])), getBalance: vi.fn(() => Promise.resolve({ balance: 50, negative: false })) } }));
vi.mock('@/services/savings.service', () => ({ savingsService: { list: vi.fn(() => Promise.resolve([{ id: 'g1', status: 'ACTIVE' }])), contribute: vi.fn(() => Promise.resolve({})) } }));
import { savingsService } from '@/services/savings.service';
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([])), listPaymentCycles: vi.fn(() => Promise.resolve([])) } }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { registerTransfer: vi.fn(() => Promise.resolve({})) } }));
import { transactionsService } from '@/services/transactions.service';
import { useTransferForm } from '@/hooks/useTransferForm';

beforeEach(() => vi.clearAllMocks());

describe('useTransferForm', () => {
  it('routes goal contributions to the savings service', async () => {
    const { result } = renderHook(() => useTransferForm());
    await waitFor(() => expect(result.current.lookups?.accounts[0].balance).toBe(50));
    await act(async () => { await result.current.submit({ kind: 'GOAL_CONTRIBUTION', sourceAccountId: 'a1', targetId: 'g1', amount: 5, currency: 'PEN', economicDate: '2026-06-03', description: ' Aporte mensual ' }); });
    expect(savingsService.contribute).toHaveBeenCalledWith('g1', expect.objectContaining({ amount: 5, description: 'Aporte mensual' }));
  });
});

it.each(['ACCOUNT_TO_ACCOUNT', 'CARD_PAYMENT'] as const)('sends the description for %s', async (kind) => {
  const { result } = renderHook(() => useTransferForm());
  await waitFor(() => expect(result.current.lookups).not.toBeNull());
  await act(async () => {
    expect(await result.current.submit({ kind, sourceAccountId: 'a1', targetId: 'target', amount: 5, currency: 'PEN', economicDate: '2026-06-03', description: ' Reserva mensual ' })).toBe(true);
  });
  expect(transactionsService.registerTransfer).toHaveBeenCalledWith(expect.objectContaining({ kind, description: 'Reserva mensual' }));
});

it('loads cancellable payment cycles and sends the selected cycle unchanged', async () => {
  const { cardsService } = await import('@/services/cards.service');
  vi.mocked(cardsService.listPaymentCycles).mockResolvedValueOnce([{ cycleStart: '2026-09-02', closingDate: '2026-10-01', paymentDueDate: '2026-10-20', billed: 100, paid: 40, amountDue: 60, status: 'OVERDUE' }]);
  const { result } = renderHook(() => useTransferForm('c1'));
  await waitFor(() => expect(result.current.paymentCycles[0]?.amountDue).toBe(60));
  expect(cardsService.listPaymentCycles).toHaveBeenCalledWith('c1', expect.any(AbortSignal));
  await act(async () => {
    await result.current.submit({ kind: 'CARD_PAYMENT', sourceAccountId: 'a1', targetId: 'c1', amount: 20, currency: 'PEN', economicDate: '2026-11-09', cycleClosingDate: '2026-10-01' });
  });
  expect(transactionsService.registerTransfer).toHaveBeenCalledWith(expect.objectContaining({ cycleClosingDate: '2026-10-01', amount: 20 }));
});

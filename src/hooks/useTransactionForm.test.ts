/**
 * Tests of the movement form hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([{ id: 'k2', name: 'Zeta' }, { id: 'k1', name: 'Alfa' }])), register: vi.fn(() => Promise.resolve({ id: 't1' })), get: vi.fn(() => Promise.resolve({ id: 't1', nature: 'EXPENSE', amount: 10, currency: 'PEN', categoryId: 'k1', economicDate: '2026-06-03', paymentMethodKind: 'ACCOUNT', instrumentId: 'a1', merchant: 'Tambo', incomeSource: null, paymentDueId: null, status: 'ACTIVE', description: null })), update: vi.fn(() => Promise.resolve({})), voidTransaction: vi.fn(() => Promise.resolve({})), suggestMerchants: vi.fn(() => Promise.resolve(['Tambo'])) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([])), listBillingCycles: vi.fn(() => Promise.resolve([{ closingDate: '2026-06-10' }, { closingDate: '2026-07-10' }])) } }));
vi.mock('@/services/budgets.service', () => ({ budgetsService: { list: vi.fn(() => Promise.resolve([{ categoryId: 'k1', limit: 0 }])) } }));
import { cardsService } from '@/services/cards.service';
import { transactionsService } from '@/services/transactions.service';
import type { Card } from '@/types/card';
import type { RegisterTransactionFormInput } from '@/types/transaction';
import { useTransactionForm } from '@/hooks/useTransactionForm';

const card: Card = {
  id: 'c1', name: 'Visa', bankName: 'BCP', bankId: null, customBankName: 'BCP', currency: 'PEN',
  creditLine: 1000, billingDate: '2026-06-10', billingCutoffTime: '22:00', paymentDueDate: '2026-06-28',
  color: '#3333B2', insurancePercentage: null, openingDebts: [],
};
const expense: RegisterTransactionFormInput = {
  nature: 'EXPENSE', amount: 5, currency: 'PEN', categoryId: 'k1', economicDate: '2026-06-10',
  paymentMethodKind: 'CARD', instrumentId: 'c1', cycleClosingDate: null, description: null,
  merchant: null, essentiality: null, mood: null, incomeType: null, incomeSource: null, incomeFrequency: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(cardsService.list).mockResolvedValue([card]);
});

describe('useTransactionForm', () => {
  it('sorts categories and detects a zero limit', async () => {
    const { result } = renderHook(() => useTransactionForm());
    await waitFor(() => expect(result.current.lookups?.expenseCategories[0].name).toBe('Alfa'));
    await expect(result.current.findZeroLimit('k1', 'PEN', '2026-06-03')).resolves.toBe(true);
    await expect(result.current.suggestMerchants('Ta')).resolves.toEqual(['Tambo']);
  });
  it('assigns the billing cycle of a card expense', async () => {
    const { transactionsService } = await import('@/services/transactions.service');
    const { result } = renderHook(() => useTransactionForm());
    await waitFor(() => expect(result.current.lookups).not.toBeNull());
    await act(async () => {
      await result.current.register({ nature: 'EXPENSE', amount: 5, currency: 'PEN', categoryId: 'k1', economicDate: '2026-06-12', paymentMethodKind: 'CARD', instrumentId: 'c1', cycleClosingDate: null, description: null, merchant: null, essentiality: null, mood: null, incomeType: null, incomeSource: null, incomeFrequency: null });
    });
    expect(transactionsService.register).toHaveBeenCalledWith(expect.objectContaining({ cycleClosingDate: '2026-07-10' }));
  });
  it('keeps an expense made on the closing day in the cycle that closes that day', async () => {
    const { transactionsService } = await import('@/services/transactions.service');
    const { result } = renderHook(() => useTransactionForm());
    await waitFor(() => expect(result.current.lookups).not.toBeNull());
    await act(async () => {
      await result.current.register({ nature: 'EXPENSE', amount: 5, currency: 'PEN', categoryId: 'k1', economicDate: '2026-06-10', paymentMethodKind: 'CARD', instrumentId: 'c1', cycleClosingDate: null, description: null, merchant: null, essentiality: null, mood: null, incomeType: null, incomeSource: null, incomeFrequency: null });
    });
    expect(transactionsService.register).toHaveBeenLastCalledWith(expect.objectContaining({ cycleClosingDate: '2026-06-10' }));
  });
  it.each([
    ['before cut-off', '21:00', '22:00', '2026-06-10', '2026-06-10'],
    ['exactly at cut-off', '22:00', '22:00', '2026-06-10', '2026-06-10'],
    ['after cut-off', '22:05', '22:00', '2026-06-10', '2026-07-10'],
    ['without a time', undefined, '22:00', '2026-06-10', '2026-06-10'],
    ['with an empty time', '', '22:00', '2026-06-10', '2026-06-10'],
    ['without a cut-off', '22:30', null, '2026-06-10', '2026-06-10'],
    ['on another date', '22:30', '22:00', '2026-06-09', '2026-06-10'],
    ['after the closing day', '22:30', '22:00', '2026-06-11', '2026-07-10'],
  ])('assigns a purchase %s and never persists its time', async (_case, purchaseTime, billingCutoffTime, economicDate, cycleClosingDate) => {
    vi.mocked(cardsService.list).mockResolvedValue([{ ...card, billingCutoffTime }]);
    const { result } = renderHook(() => useTransactionForm());
    await waitFor(() => expect(result.current.lookups).not.toBeNull());
    await act(async () => { await result.current.register({ ...expense, economicDate, purchaseTime }); });
    expect(transactionsService.register).toHaveBeenLastCalledWith({ ...expense, economicDate, cycleClosingDate });
  });

  it('uses the cut-off on update without sending the purchase time', async () => {
    const { result } = renderHook(() => useTransactionForm('t1'));
    await waitFor(() => expect(result.current.lookups).not.toBeNull());
    const { nature: _nature, ...input } = expense;
    void _nature;
    await act(async () => { await result.current.update({ ...input, purchaseTime: '22:30' }); });
    expect(transactionsService.update).toHaveBeenCalledWith('t1', { ...input, cycleClosingDate: '2026-07-10' });
  });

});

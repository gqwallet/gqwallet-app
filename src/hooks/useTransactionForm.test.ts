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
import { useTransactionForm } from '@/hooks/useTransactionForm';

beforeEach(() => vi.clearAllMocks());

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
});

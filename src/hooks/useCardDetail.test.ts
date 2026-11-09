/**
 * Tests of the card detail hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/cards.service', () => ({ cardsService: { get: vi.fn(() => Promise.resolve({ id: 'c1', name: 'Visa', bankName: 'BCP', currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null })), getCreditLineUsage: vi.fn(() => Promise.resolve({ used: 0 })), getNextBilling: vi.fn(() => Promise.resolve({ cycleStart: '2026-05-11', billingDate: '2026-06-10' })) } }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([])), list: vi.fn(() => Promise.resolve({ content: [], totals: [], page: 0, size: 1, totalElements: 2, totalPages: 1 })) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])), getBalance: vi.fn(() => Promise.resolve({ accountId: 'a1', currency: 'PEN', cutoff: '2026-06-03', balance: 50, negative: false })) } }));
import { useCardDetail } from '@/hooks/useCardDetail';

beforeEach(() => vi.clearAllMocks());

describe('useCardDetail', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useCardDetail('c1'));
    await waitFor(() => expect(result.current.data?.accounts[0].balance).toBe(50));
  });
});

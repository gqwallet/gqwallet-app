/**
 * Tests of the cards hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn(() => Promise.resolve([{ id: 'c1', name: 'Visa', bankName: 'BCP', currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null }])), listPaymentCycles: vi.fn(() => Promise.resolve([])), getCreditLineUsage: vi.fn(() => Promise.resolve({ used: 0 })), getNextBilling: vi.fn(() => Promise.resolve({ amountDue: 5 })), register: vi.fn(() => Promise.resolve({ id: 'c1', name: 'Visa', bankName: 'BCP', currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null })), update: vi.fn(() => Promise.resolve({ id: 'c1', name: 'Visa', bankName: 'BCP', currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null })), remove: vi.fn(() => Promise.resolve(undefined)) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])), getBalance: vi.fn(() => Promise.resolve({ accountId: 'a1', currency: 'PEN', cutoff: '2026-06-03', balance: 50, negative: false })) } }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { list: vi.fn(() => Promise.resolve({ content: [], totals: [], page: 0, size: 1, totalElements: 2, totalPages: 1 })) } }));
import { useCards } from '@/hooks/useCards';

beforeEach(() => vi.clearAllMocks());

describe('useCards', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useCards());
    await waitFor(() => expect(result.current.cards?.[0].nextBilling.amountDue).toBe(5));
  });
});

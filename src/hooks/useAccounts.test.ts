/**
 * Tests of the accounts hooks.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])), getBalance: vi.fn(() => Promise.resolve({ accountId: 'a1', currency: 'PEN', cutoff: '2026-06-03', balance: 50, negative: false })), register: vi.fn(async () => { const { ApiError } = await import('@/types/api'); throw new ApiError(409); }) } }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { list: vi.fn(() => Promise.resolve({ content: [], totals: [], page: 0, size: 1, totalElements: 2, totalPages: 1 })) } }));
import { useAccounts } from '@/hooks/useAccounts';

beforeEach(() => vi.clearAllMocks());

describe('useAccounts', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useAccounts());
    await waitFor(() => expect(result.current.accounts?.[0].movementCount).toBe(2));
  });
});

/**
 * Tests of the goals hooks.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/savings.service', () => ({ savingsService: { list: vi.fn(() => Promise.resolve([{ id: 'g1', emergencyFund: true, currency: 'PEN' }])), getEmergencyFund: vi.fn(() => Promise.resolve({ coverageMonths: 2, minimum: 300 })), contribute: vi.fn(() => Promise.resolve({})), get: vi.fn(() => Promise.resolve({})), listContributions: vi.fn(() => Promise.resolve([])), create: vi.fn(() => Promise.resolve({})) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn(() => Promise.resolve([{ id: 'a1', alias: 'BCP', bankName: 'BCP', type: 'DEBIT', currency: 'PEN', openingBalance: 100, openingBalanceAsOf: '2026-01-01', status: 'ACTIVE' }])), getBalance: vi.fn(() => Promise.resolve({ accountId: 'a1', currency: 'PEN', cutoff: '2026-06-03', balance: 50, negative: false })) } }));
import { useGoals } from '@/hooks/useGoals';

beforeEach(() => vi.clearAllMocks());

describe('useGoals', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useGoals());
    await waitFor(() => expect(result.current.data?.coverage.g1).toBe(2));
    let saved = false;
    await act(async () => { saved = await result.current.contribute('g1', { sourceAccountId: 'a1', amount: 1, currency: 'PEN', economicDate: '2026-06-03' }); });
    expect(saved).toBe(true);
  });
});

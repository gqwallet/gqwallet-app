/**
 * Tests of the budget hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/budgets.service', () => ({ budgetsService: { getStatus: vi.fn(() => Promise.resolve({ lines: [] })), list: vi.fn(() => Promise.resolve([{ id: 'b1', categoryId: 'k1', limit: 0 }])), update: vi.fn(() => Promise.resolve({})), create: vi.fn(() => Promise.resolve({})), copy: vi.fn(() => Promise.resolve({ created: 1 })) } }));
import { budgetsService } from '@/services/budgets.service';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([])) } }));
import { useBudget } from '@/hooks/useBudget';

beforeEach(() => vi.clearAllMocks());

describe('useBudget', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useBudget('2026-06', 'PEN'));
    await waitFor(() => expect(result.current.data?.limits.k1.limit).toBe(0));
    await act(async () => { await result.current.saveLimit('k1', 50); });
    expect(budgetsService.update).toHaveBeenCalledWith('b1', 50);
  });
});

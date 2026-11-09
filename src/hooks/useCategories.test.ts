/**
 * Tests of the categories hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([{ id: '2', name: 'Zeta' }, { id: '1', name: 'Alfa' }])), createCategory: vi.fn(async () => { const { ApiError } = await import('@/types/api'); throw new ApiError(409); }), list: vi.fn(() => Promise.resolve({ content: [], totals: [], page: 0, size: 1, totalElements: 2, totalPages: 1 })) } }));
import { useCategories } from '@/hooks/useCategories';

beforeEach(() => vi.clearAllMocks());

describe('useCategories', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useCategories('EXPENSE'));
    await waitFor(() => expect(result.current.categories.map((category) => category.name)).toEqual(['Alfa', 'Zeta']));
  });
});

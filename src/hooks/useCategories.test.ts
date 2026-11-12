/**
 * Tests of the categories hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn(() => Promise.resolve([{ id: '2', name: 'Zeta' }, { id: '1', name: 'Alfa' }])), reactivateCategory: vi.fn(() => Promise.resolve({ id: 'c1', name: 'Comida', nature: 'EXPENSE', status: 'ACTIVE' })), createCategory: vi.fn(async () => { const { ApiError } = await import('@/types/api'); throw new ApiError(409); }), list: vi.fn(() => Promise.resolve({ content: [], totals: [], page: 0, size: 1, totalElements: 2, totalPages: 1 })) } }));
import { useCategories } from '@/hooks/useCategories';

beforeEach(() => vi.clearAllMocks());

describe('useCategories', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useCategories('EXPENSE'));
    await waitFor(() => expect(result.current.categories.map((category) => category.name)).toEqual(['Alfa', 'Zeta']));
  });
});

it('reactivates through the service and refreshes the category list', async () => {
  const { transactionsService } = await import('@/services/transactions.service');
  const { result } = renderHook(() => useCategories('EXPENSE'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  await act(async () => { expect(await result.current.reactivate('c1')).toMatchObject({ id: 'c1', status: 'ACTIVE' }); });
  expect(transactionsService.reactivateCategory).toHaveBeenCalledWith('c1');
  expect(transactionsService.listCategories).toHaveBeenCalledTimes(2);
});

it('blocks simultaneous category writes until the first request completes', async () => {
  const { transactionsService } = await import('@/services/transactions.service');
  let finish: (() => void) | undefined;
  vi.mocked(transactionsService.reactivateCategory).mockImplementationOnce(() => new Promise((resolve) => {
    finish = () => resolve({ id: 'c1', name: 'Comida', nature: 'EXPENSE', status: 'ACTIVE' });
  }));
  const { result } = renderHook(() => useCategories('EXPENSE'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  await act(async () => {
    const first = result.current.reactivate('c1');
    expect(await result.current.reactivate('c1')).toBeNull();
    finish?.();
    await first;
  });
  expect(transactionsService.reactivateCategory).toHaveBeenCalledOnce();
});

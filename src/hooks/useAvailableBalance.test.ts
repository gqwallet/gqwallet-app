/**
 * Tests of the available balance hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/overview.service', () => ({ overviewService: { getAvailableBalance: vi.fn(() => Promise.resolve({ available: 10 })) } }));
import { overviewService } from '@/services/overview.service';
import { useAvailableBalance } from '@/hooks/useAvailableBalance';

beforeEach(() => vi.clearAllMocks());

describe('useAvailableBalance', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useAvailableBalance('PEN', '2026-06-03'));
    await waitFor(() => expect(result.current.data).toEqual({ available: 10 }));
    expect(overviewService.getAvailableBalance).toHaveBeenCalledWith('PEN', '2026-06-03', expect.any(AbortSignal));
  });
});

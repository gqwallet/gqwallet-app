/**
 * Tests of the net position hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/overview.service', () => ({ overviewService: { getNetPosition: vi.fn(() => Promise.resolve({ netPosition: 10 })) } }));
import { overviewService } from '@/services/overview.service';
import { useNetPosition } from '@/hooks/useNetPosition';

beforeEach(() => vi.clearAllMocks());

describe('useNetPosition', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useNetPosition('PEN'));
    await waitFor(() => expect(result.current.data).toEqual({ netPosition: 10 }));
    expect(overviewService.getNetPosition).toHaveBeenCalledWith('PEN', expect.any(AbortSignal));
  });
});

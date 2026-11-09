/**
 * Tests of the debt load hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/overview.service', () => ({ overviewService: { getDebtLoad: vi.fn(() => Promise.resolve({ months: [] })) } }));
import { overviewService } from '@/services/overview.service';
import { useDebtLoad } from '@/hooks/useDebtLoad';

beforeEach(() => vi.clearAllMocks());

describe('useDebtLoad', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useDebtLoad(2026, 'PEN', 7));
    await waitFor(() => expect(result.current.data).toEqual({ months: [] }));
    expect(overviewService.getDebtLoad).toHaveBeenCalledWith(2026, 'PEN', 7, expect.any(AbortSignal));
  });
});

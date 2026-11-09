/**
 * Tests of the consolidated view hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overviewService } from '@/services/overview.service';
import { useConsolidatedView } from '@/hooks/useConsolidatedView';
import { ApiError } from '@/types/api';

vi.mock('@/services/overview.service', () => ({ overviewService: { getConsolidatedPosition: vi.fn(), getCashFlow: vi.fn((_year: number, currency: string) => Promise.resolve({ rows: Array.from({ length: 12 }, () => ({ flow: currency === 'PEN' ? 100 : 10 })) })) } }));
vi.mock('@/services/profiles.service', () => ({ profilesService: { registerExchangeRate: vi.fn(() => Promise.resolve({})) } }));

const position = { targetCurrency: 'PEN', penAvailable: 150, usdAvailable: 20, rate: 3.75, rateDate: '2026-06-01', consolidated: 225, referential: true, available: true } as const;
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(overviewService.getConsolidatedPosition).mockResolvedValue(position);
});

describe('useConsolidatedView', () => {
  it('converts the dollar flow with the registered rate', async () => {
    const { result } = renderHook(() => useConsolidatedView('PEN'));
    await waitFor(() => expect(result.current.data?.flow.consolidated).toBeCloseTo(137.5));
  });

  it('preserves currency balances without consolidating when available is false', async () => {
    vi.mocked(overviewService.getConsolidatedPosition).mockResolvedValueOnce({ ...position, available: false, rate: null, rateDate: null, consolidated: null });
    const { result } = renderHook(() => useConsolidatedView('PEN'));
    await waitFor(() => expect(result.current.data?.position.available).toBe(false));
    expect(result.current.data?.position.penAvailable).toBe(150);
    expect(result.current.data?.position.usdAvailable).toBe(20);
    expect(result.current.data?.flow).toMatchObject({ pen: 100, usd: 10, consolidated: null });
    expect(result.current.error).toBeNull();
  });

  it('surfaces a 404 as an error instead of inventing an empty position', async () => {
    vi.mocked(overviewService.getConsolidatedPosition).mockRejectedValueOnce(new ApiError(404));
    const { result } = renderHook(() => useConsolidatedView('PEN'));
    await waitFor(() => expect(result.current.error?.status).toBe(404));
    expect(result.current.data).toBeNull();
  });
});

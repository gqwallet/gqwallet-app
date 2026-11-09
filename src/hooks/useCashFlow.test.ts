/**
 * Tests of the cash flow hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/overview.service', () => ({ overviewService: { getCashFlow: vi.fn(() => Promise.resolve({ rows: [] })), exportCashFlowCsv: vi.fn(() => Promise.resolve({ content: 'a', fileName: null })) } }));
import { overviewService } from '@/services/overview.service';
import { downloadText } from '@/utils/download';
import { useCashFlow } from '@/hooks/useCashFlow';

vi.mock('@/utils/download', async (importOriginal) => ({ ...await importOriginal<typeof import('@/utils/download')>(), downloadText: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe('useCashFlow', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useCashFlow(2026, 'PEN'));
    await waitFor(() => expect(result.current.data?.cashFlow.rows).toEqual([]));
    expect(overviewService.getCashFlow).toHaveBeenCalledWith(2026, 'PEN', expect.any(AbortSignal));
  });
});

it.each(['server.csv', null])('exports CSV using filename %s with a B-11 fallback', async (fileName) => {
  vi.mocked(overviewService.exportCashFlowCsv).mockResolvedValueOnce({ content: 'id\n1', fileName });
  const { result } = renderHook(() => useCashFlow(2026, 'PEN'));
  await act(async () => expect(await result.current.exportCsv()).toBe(true));
  expect(downloadText).toHaveBeenCalledWith(fileName ?? 'gqwallet_flujo_caja_2026-01-01_2026-12-31.csv', 'id\n1');
});

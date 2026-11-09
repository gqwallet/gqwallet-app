/**
 * Tests of the reports hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { getExpenseReport: vi.fn(() => Promise.resolve({ total: 9 })), getIncomeReport: vi.fn(() => Promise.resolve({ total: 1 })), exportCsv: vi.fn(() => Promise.resolve({ content: '', fileName: null })) } }));
import { downloadText } from '@/utils/download';
import { transactionsService } from '@/services/transactions.service';
import { useReports } from '@/hooks/useReports';

vi.mock('@/utils/download', async (importOriginal) => ({ ...await importOriginal<typeof import('@/utils/download')>(), downloadText: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe('useReports', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useReports('EXPENSE', { year: 2026, currency: 'PEN' }));
    await waitFor(() => expect(result.current.expense?.total).toBe(9));
    expect(result.current.income).toBeNull();
  });
});

it.each(['server.csv', null])('exports CSV using filename %s with a B-11 fallback', async (fileName) => {
  vi.mocked(transactionsService.exportCsv).mockResolvedValueOnce({ content: 'id\n1', fileName });
  const { result } = renderHook(() => useReports('EXPENSE', { year: 2026, currency: 'PEN' }));
  await act(async () => expect(await result.current.exportCsv()).toBe(true));
  expect(downloadText).toHaveBeenCalledWith(fileName ?? 'gqwallet_movimientos_2026-01-01_2026-12-31.csv', 'id\n1');
});

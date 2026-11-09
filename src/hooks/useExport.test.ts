/**
 * Tests of the export hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/services/transactions.service', () => ({ transactionsService: { exportCsv: vi.fn(() => Promise.resolve({ content: 'id,importe\n1,10\n2,20\n', fileName: null })) } }));
vi.mock('@/services/obligations.service', () => ({ obligationsService: { exportFixedPaymentsCsv: vi.fn(() => Promise.resolve({ content: 'a\n', fileName: null })), exportDuesCsv: vi.fn(() => Promise.resolve({ content: 'a\n', fileName: null })) } }));
vi.mock('@/services/budgets.service', () => ({ budgetsService: { exportCsv: vi.fn(() => Promise.resolve({ content: '', fileName: null })) } }));
vi.mock('@/services/overview.service', () => ({ overviewService: { exportCashFlowCsv: vi.fn(() => Promise.resolve({ content: '', fileName: null })) } }));
import { transactionsService } from '@/services/transactions.service';
import { obligationsService } from '@/services/obligations.service';
import { budgetsService } from '@/services/budgets.service';
import { overviewService } from '@/services/overview.service';
import { useExport } from '@/hooks/useExport';

beforeEach(() => vi.clearAllMocks());

describe('useExport', () => {
  it('loads its data', async () => {
    const { result } = renderHook(() => useExport('MOVEMENTS', '2026-01-01', '2026-12-31', 'BOTH'));
    await waitFor(() => expect(result.current.files?.[0].rows).toBe(2));
    expect(result.current.files?.[0].fileName).toBe('gqwallet_movimientos_2026-01-01_2026-12-31.csv');
  });
});

it('uses the server filename instead of the client fallback', async () => {
  vi.mocked(transactionsService.exportCsv).mockResolvedValueOnce({ content: 'id\n1', fileName: 'server-name.csv' });
  const { result } = renderHook(() => useExport('MOVEMENTS', '2026-01-01', '2026-12-31', 'BOTH'));
  await waitFor(() => expect(result.current.files?.[0].fileName).toBe('server-name.csv'));
});

it('counts records with quoted newlines rather than physical lines and decodes header fields', async () => {
  vi.mocked(transactionsService.exportCsv).mockResolvedValueOnce({ content: '\uFEFFid,"description, notes"\r\n1,"Line one\r\nLine ""two"""\r\n2,Plain\r\n', fileName: null });
  const { result } = renderHook(() => useExport('MOVEMENTS', '2026-01-01', '2026-12-31', 'BOTH'));
  await waitFor(() => expect(result.current.files?.[0].rows).toBe(2));
  expect(result.current.files?.[0].columns).toEqual(['id', 'description, notes']);
});

it.each(['MOVEMENTS', 'FIXED_PAYMENTS', 'BUDGETS', 'CASH_FLOW'] as const)('propagates and aborts the %s preview signal on selection changes and unmount', async (entity) => {
  const services = entity === 'MOVEMENTS' ? [transactionsService.exportCsv] : entity === 'FIXED_PAYMENTS' ? [obligationsService.exportFixedPaymentsCsv, obligationsService.exportDuesCsv] : entity === 'BUDGETS' ? [budgetsService.exportCsv] : [overviewService.exportCashFlowCsv];
  const { result, rerender, unmount } = renderHook(({ currency }) => useExport(entity, '2026-01-01', '2026-12-31', currency), { initialProps: { currency: 'BOTH' as 'BOTH' | 'USD' } });
  await waitFor(() => expect(result.current.files).not.toBeNull());
  const signals = services.map((service) => {
    expect(service).toHaveBeenCalledWith('2026-01-01', '2026-12-31', 'BOTH', expect.any(AbortSignal));
    return vi.mocked(service).mock.calls[0][3]!;
  });
  expect(signals.every((signal) => !signal.aborted)).toBe(true);
  rerender({ currency: 'USD' });
  expect(signals.every((signal) => signal.aborted)).toBe(true);
  const nextSignals = services.map((service) => vi.mocked(service).mock.calls[1][3]!);
  unmount();
  expect(nextSignals.every((signal) => signal.aborted)).toBe(true);
});

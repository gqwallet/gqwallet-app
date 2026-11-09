/**
 * Tests of the overview service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/services/api-client';

vi.mock('@/services/api-client', () => ({
  apiClient: { getCsv: vi.fn().mockResolvedValue({ content: 'csv', fileName: 'server.csv' }), get: vi.fn().mockResolvedValue([]), post: vi.fn().mockResolvedValue({}), put: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue(undefined) },
}));

beforeEach(() => vi.clearAllMocks());
import { overviewService } from '@/services/overview.service';

describe('overviewService', () => {
  it('calls GET for getDashboard', async () => {
    await overviewService.getDashboard('PEN');
    expect(apiClient.get).toHaveBeenCalledWith('/dashboards/me', { params: { currency: 'PEN' }, signal: undefined });
  });
  it('calls GET for getCashFlow', async () => {
    await overviewService.getCashFlow(2026, 'USD');
    expect(apiClient.get).toHaveBeenCalledWith('/cash-flows/me', { params: { year: 2026, currency: 'USD' }, signal: undefined });
  });
  it('calls GET for getDebtLoad', async () => {
    await overviewService.getDebtLoad(2026, 'PEN', 7);
    expect(apiClient.get).toHaveBeenCalledWith('/debt-loads/me', { params: { year: 2026, currency: 'PEN', threshold: 7 }, signal: undefined });
  });
  it('calls GET for listCalendarEntries', async () => {
    await overviewService.listCalendarEntries('2026-06-01', '2026-06-30');
    expect(apiClient.get).toHaveBeenCalledWith('/payment-calendar-entries', { params: { from: '2026-06-01', to: '2026-06-30' }, signal: undefined });
  });
});

it('preserves CSV metadata from exportCashFlowCsv', async () => {
  const { signal } = new AbortController();
  await expect(overviewService.exportCashFlowCsv('2026-01-01', '2026-12-31', 'BOTH', signal)).resolves.toEqual({ content: 'csv', fileName: 'server.csv' });
  expect(apiClient.getCsv).toHaveBeenCalledWith('/cash-flows/me', { params: { from: '2026-01-01', to: '2026-12-31', currency: 'BOTH' }, signal });
});

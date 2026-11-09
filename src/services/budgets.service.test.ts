/**
 * Tests of the budgets service.
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
import { budgetsService } from '@/services/budgets.service';

describe('budgetsService', () => {
  it('calls GET for getStatus', async () => {
    await budgetsService.getStatus('2026-06', 'PEN');
    expect(apiClient.get).toHaveBeenCalledWith('/budget-statuses/me', { params: { period: '2026-06', currency: 'PEN' }, signal: undefined });
  });
  it('calls POST for copy', async () => {
    await budgetsService.copy('2026-05', '2026-06');
    expect(apiClient.post).toHaveBeenCalledWith('/budget-copies', { fromPeriod: '2026-05', toPeriod: '2026-06' });
  });
  it('calls PUT for update', async () => {
    await budgetsService.update('b1', 0);
    expect(apiClient.put).toHaveBeenCalledWith('/budgets/b1', { limit: 0 });
  });
  it('calls GET for exportCsv', async () => {
  const { signal } = new AbortController();
    await budgetsService.exportCsv('2026-01-01', '2026-12-31', 'BOTH', signal);
    expect(apiClient.getCsv).toHaveBeenCalledWith('/budgets', { params: { from: '2026-01-01', to: '2026-12-31', currency: 'BOTH' }, signal });
  });
});

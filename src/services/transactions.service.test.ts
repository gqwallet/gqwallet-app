/**
 * Tests of the transactions service.
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
import { transactionsService } from '@/services/transactions.service';

describe('transactionsService', () => {
  it('calls POST for voidTransaction', async () => {
    await transactionsService.voidTransaction('t1', 'dup');
    expect(apiClient.post).toHaveBeenCalledWith('/transactions/t1/voids', { reason: 'dup' });
  });
  it('calls GET for listCategories', async () => {
    await transactionsService.listCategories('EXPENSE');
    expect(apiClient.get).toHaveBeenCalledWith('/categories', { params: { nature: 'EXPENSE' }, signal: undefined });
  });
  it('calls POST for createCategory', async () => {
    await transactionsService.createCategory('Viajes', 'EXPENSE');
    expect(apiClient.post).toHaveBeenCalledWith('/categories', { name: 'Viajes', nature: 'EXPENSE' });
  });
  it('calls GET for exportCsv', async () => {
  const { signal } = new AbortController();
    await transactionsService.exportCsv('2026-01-01', '2026-01-31', 'PEN', signal);
    expect(apiClient.getCsv).toHaveBeenCalledWith('/transactions', { params: { from: '2026-01-01', to: '2026-01-31', currency: 'PEN' }, signal });
  });
  it('maps merchant suggestions to names', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([{ name: 'Tambo' }]);
    await expect(transactionsService.suggestMerchants('Ta')).resolves.toEqual(['Tambo']);
  });
});

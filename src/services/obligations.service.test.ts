/**
 * Tests of the obligations service.
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
import { obligationsService } from '@/services/obligations.service';

describe('obligationsService', () => {
  it('calls GET for getUpcoming', async () => {
    await obligationsService.getUpcoming();
    expect(apiClient.get).toHaveBeenCalledWith('/upcoming-dues/me', { signal: undefined });
  });
  it('calls POST for settle', async () => {
    await obligationsService.settle('d1', { paymentMethodKind: 'ACCOUNT', instrumentId: 'a1', economicDate: '2026-06-03', paidAmount: null });
    expect(apiClient.post).toHaveBeenCalledWith('/payment-dues/d1/settlements', { paymentMethodKind: 'ACCOUNT', instrumentId: 'a1', economicDate: '2026-06-03', paidAmount: null });
  });
  it('calls POST for finish', async () => {
    await obligationsService.finish('f1');
    expect(apiClient.post).toHaveBeenCalledWith('/fixed-payments/f1/finishes');
  });
  it('calls GET for getSummary', async () => {
    await obligationsService.getSummary('USD');
    expect(apiClient.get).toHaveBeenCalledWith('/fixed-payment-summaries/me', { params: { currency: 'USD' }, signal: undefined });
  });
});

it('preserves CSV metadata from exportFixedPaymentsCsv', async () => {
  const { signal } = new AbortController();
  await expect(obligationsService.exportFixedPaymentsCsv('2026-01-01', '2026-12-31', 'BOTH', signal)).resolves.toEqual({ content: 'csv', fileName: 'server.csv' });
  expect(apiClient.getCsv).toHaveBeenCalledWith('/fixed-payments', { params: { from: '2026-01-01', to: '2026-12-31', currency: 'BOTH' }, signal });
});

it('preserves CSV metadata from exportDuesCsv', async () => {
  const { signal } = new AbortController();
  await expect(obligationsService.exportDuesCsv('2026-01-01', '2026-12-31', 'BOTH', signal)).resolves.toEqual({ content: 'csv', fileName: 'server.csv' });
  expect(apiClient.getCsv).toHaveBeenCalledWith('/payment-dues', { params: { from: '2026-01-01', to: '2026-12-31', currency: 'BOTH' }, signal });
});

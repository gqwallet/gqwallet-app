/**
 * Tests of the obligations service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/services/api-client';
import type { RegisterFixedPaymentInput } from '@/types/obligation';

vi.mock('@/services/api-client', () => ({
  apiClient: { getCsv: vi.fn().mockResolvedValue({ content: 'csv', fileName: 'server.csv' }), get: vi.fn().mockResolvedValue([]), post: vi.fn().mockResolvedValue({}), put: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue(undefined) },
}));

beforeEach(() => vi.clearAllMocks());
import { obligationsService } from '@/services/obligations.service';

describe('obligationsService', () => {
  it('includes previously paid installments in registration and update requests', async () => {
    const input: RegisterFixedPaymentInput = {
      description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE', budgetCategoryId: 'c1', amount: 250,
      currency: 'PEN', dueDay: 28, startMonth: '2026-10', totalInstallments: 24, paidInstallments: 13,
      usualPaymentMethodKind: null, usualInstrumentId: null,
    };
    await obligationsService.register(input);
    expect(apiClient.post).toHaveBeenCalledWith('/fixed-payments', input);
    const update = {
      description: input.description, budgetCategoryId: input.budgetCategoryId, amount: input.amount,
      dueDay: input.dueDay, paidInstallments: input.paidInstallments,
      usualPaymentMethodKind: input.usualPaymentMethodKind, usualInstrumentId: input.usualInstrumentId,
    };
    await obligationsService.update('f1', update);
    expect(apiClient.put).toHaveBeenCalledWith('/fixed-payments/f1', update);
  });

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

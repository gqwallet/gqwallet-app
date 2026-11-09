/**
 * Tests of the cards service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/services/api-client';

vi.mock('@/services/api-client', () => ({
  apiClient: { get: vi.fn().mockResolvedValue([]), post: vi.fn().mockResolvedValue({}), put: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue(undefined) },
}));

beforeEach(() => vi.clearAllMocks());
import { cardsService } from '@/services/cards.service';

describe('cardsService', () => {
  it('calls GET for list', async () => {
    await cardsService.list();
    expect(apiClient.get).toHaveBeenCalledWith('/cards', { signal: undefined });
  });
  it('calls DELETE for remove', async () => {
    await cardsService.remove('c1');
    expect(apiClient.delete).toHaveBeenCalledWith('/cards/c1');
  });
  it('calls GET for getNextBilling', async () => {
    await cardsService.getNextBilling('c1');
    expect(apiClient.get).toHaveBeenCalledWith('/cards/c1/next-billing', { signal: undefined });
  });
  it('calls GET for listPaymentCycles', async () => {
    await cardsService.listPaymentCycles('c1');
    expect(apiClient.get).toHaveBeenCalledWith('/cards/c1/payment-cycles', { signal: undefined });
  });
});

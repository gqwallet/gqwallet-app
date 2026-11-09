/**
 * Tests of the cards service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegisterCardInput } from '@/types/card';
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
  it.each(['22:00', null])('passes the optional cut-off through register and update: %s', async (billingCutoffTime) => {
    const input: RegisterCardInput = {
      name: 'Visa', bankId: null, customBankName: 'BCP', currency: 'PEN', creditLine: 1000,
      billingDate: '2026-11-10', paymentDueDate: '2026-11-28', billingCutoffTime,
      color: '#3333B2', insurancePercentage: null,
    };
    await cardsService.register(input);
    expect(apiClient.post).toHaveBeenLastCalledWith('/cards', input);
    const { currency: _currency, ...update } = input;
    void _currency;
    await cardsService.update('c1', update);
    expect(apiClient.put).toHaveBeenLastCalledWith('/cards/c1', update);
  });

});

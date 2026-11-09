/**
 * Tests of the savings service.
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
import { savingsService } from '@/services/savings.service';

describe('savingsService', () => {
  it('calls GET for list', async () => {
    await savingsService.list();
    expect(apiClient.get).toHaveBeenCalledWith('/savings-goals', { signal: undefined });
  });
  it('calls POST for contribute', async () => {
    await savingsService.contribute('g1', { sourceAccountId: 'a1', amount: 10, currency: 'USD', economicDate: '2026-06-03', description: 'Aporte mensual' });
    expect(apiClient.post).toHaveBeenCalledWith('/savings-goals/g1/contributions', { sourceAccountId: 'a1', amount: 10, currency: 'USD', economicDate: '2026-06-03', description: 'Aporte mensual' });
  });
  it('calls GET for getEmergencyFund', async () => {
    await savingsService.getEmergencyFund('PEN');
    expect(apiClient.get).toHaveBeenCalledWith('/emergency-funds/me', { params: { currency: 'PEN' }, signal: undefined });
  });
});

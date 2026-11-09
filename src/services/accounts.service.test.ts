/**
 * Tests of the accounts service.
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
import { accountsService } from '@/services/accounts.service';

describe('accountsService', () => {
  it('calls GET for list', async () => {
    await accountsService.list();
    expect(apiClient.get).toHaveBeenCalledWith('/accounts', { signal: undefined });
  });
  it('calls POST for deactivate', async () => {
    await accountsService.deactivate('a1');
    expect(apiClient.post).toHaveBeenCalledWith('/accounts/a1/deactivations');
  });
  it('calls GET for getBalance', async () => {
    await accountsService.getBalance('a1', '2026-06-03');
    expect(apiClient.get).toHaveBeenCalledWith('/accounts/a1/balance', { params: { cutoff: '2026-06-03' }, signal: undefined });
  });
});

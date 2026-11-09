/**
 * Tests of the platform service.
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
import { platformService } from '@/services/platform.service';

describe('platformService', () => {
  it('calls POST for linkCalendar', async () => {
    await platformService.linkCalendar('code');
    expect(apiClient.post).toHaveBeenCalledWith('/calendar-links', { authorizationCode: 'code' });
  });
  it('calls DELETE for unlink', async () => {
    await platformService.unlink('l1');
    expect(apiClient.delete).toHaveBeenCalledWith('/calendar-links/l1');
  });
  it('calls GET for getMetrics', async () => {
    await platformService.getMetrics();
    expect(apiClient.get).toHaveBeenCalledWith('/metrics', { signal: undefined });
  });
});

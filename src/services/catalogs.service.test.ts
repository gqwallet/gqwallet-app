/**
 * Tests country catalog transport and request cancellation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, it, vi } from 'vitest';
import { apiClient } from '@/services/api-client';
import { catalogsService } from '@/services/catalogs.service';
vi.mock('@/services/api-client', () => ({ apiClient: { get: vi.fn().mockResolvedValue([]) } }));
it('passes the selected country and abort signal through the single client', async () => {
  const controller = new AbortController();
  await catalogsService.listBanks('PE', controller.signal);
  expect(apiClient.get).toHaveBeenCalledWith('/banks', { params: { country: 'PE' }, signal: controller.signal });
});

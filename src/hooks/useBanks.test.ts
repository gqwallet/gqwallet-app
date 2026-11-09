/**
 * Tests bank catalog reloads and cancellation on country changes.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useBanks } from '@/hooks/useBanks';
import { catalogsService } from '@/services/catalogs.service';
vi.mock('@/services/catalogs.service', () => ({ catalogsService: { listBanks: vi.fn().mockResolvedValue([]) } }));
it('defaults to Peru, cancels the previous country and reloads the selected catalog', async () => {
  const { rerender, unmount } = renderHook(({ country }) => useBanks(country), { initialProps: { country: undefined as string | undefined } });
  await waitFor(() => expect(catalogsService.listBanks).toHaveBeenCalledWith('PE', expect.any(AbortSignal)));
  const signal = vi.mocked(catalogsService.listBanks).mock.calls[0][1];
  rerender({ country: 'CL' });
  await waitFor(() => expect(catalogsService.listBanks).toHaveBeenLastCalledWith('CL', expect.any(AbortSignal)));
  expect(signal?.aborted).toBe(true);
  const current = vi.mocked(catalogsService.listBanks).mock.calls.at(-1)?.[1];
  unmount(); expect(current?.aborted).toBe(true);
});

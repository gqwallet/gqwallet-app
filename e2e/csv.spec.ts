/**
 * Checks browser CSV filenames with plain, extended and missing response metadata.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
import { signUp, uniqueEmail } from './helpers.ts';

for (const scenario of [
  { name: 'plain filename', header: 'attachment; filename="servidor.csv"', expected: 'servidor.csv' },
  { name: 'extended UTF-8 filename', header: "attachment; filename=plain.csv; filename*=UTF-8''movimientos%20Per%C3%BA.csv", expected: 'movimientos Perú.csv' },
  { name: 'missing filename', header: null, expected: null },
]) {
  test(`CSV download respects ${scenario.name}`, async ({ page }) => {
    await signUp(page, uniqueEmail('csv'));
    await page.getByRole('button', { name: 'Omitir por ahora' }).click();
    await page.route('**/api/v1/transactions?**', async (route) => {
      if (route.request().headers()['accept'] !== 'text/csv') {
        await route.continue();
        return;
      }
      // Keep the real backend CSV, changing metadata to distinguish it from the client fallback.
      const response = await route.fetch();
      const headers = { ...response.headers() };
      delete headers['content-disposition'];
      if (scenario.header) headers['content-disposition'] = scenario.header;
      await route.fulfill({ response, headers });
    });
    await page.goto('/exportar');
    await expect(page.getByRole('button', { name: 'Descargar CSV' })).toBeEnabled();
    const from = await page.getByLabel('Desde', { exact: true }).inputValue();
    const to = await page.getByLabel('Hasta', { exact: true }).inputValue();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar CSV' }).click();
    expect((await download).suggestedFilename()).toBe(scenario.expected ?? `gqwallet_movimientos_${from}_${to}.csv`);
  });
}

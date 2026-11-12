/**
 * Compact mixed-currency history and shared contextual help regression.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
test('mixed currencies stay identifiable and information remains keyboard accessible', async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
    let body: unknown = [];
    if (path === '/transactions') body = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 20, totals: [] };
    if (path === '/profiles/me') body = { id: 'p', firstName: 'Ana', countryCode: 'PE', preferredCurrency: 'PEN', monthlyIncome: 1000, lifeCushion: 0, roles: [] };
    if (path === '/ledger-entries') body = { content: ['PEN', 'USD'].map((currency, i) => ({ id: `t${i}`, entryType: 'MOVEMENT', title: 'Cafeterías', economicDate: '2026-11-12', paymentMethod: { label: 'Efectivo' }, amount: 12, currency, nature: 'EXPENSE', status: 'ACTIVE' })), totalElements: 2, totalPages: 1, number: 0, size: 20, totals: [], last: true };
    await route.fulfill({ json: body });
  });
  await page.goto('/movimientos');
  for (const amount of ['−S/ 12.00', '−US$ 12.00']) await expect(page.getByText(amount, { exact: true })).toBeVisible();
  const rows = page.getByRole('button', { name: /Cafeterías.*12.00/ });
  await expect(rows).toHaveCount(2);
  await expect(rows.first().getByText('PEN', { exact: true })).toHaveCount(0);
  await expect(rows.nth(1).getByText('USD', { exact: true })).toHaveCount(0);
  const trigger = page.getByRole('button', { name: 'Información sobre Movimientos', exact: true }).first();
  await trigger.blur();
  await expect(trigger.locator('.material-symbols-rounded')).toHaveCSS('opacity', '0.6');
  const bounds = await trigger.boundingBox(); expect(bounds?.width).toBe(44); expect(bounds?.height).toBe(44);
  await trigger.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Movimientos', exact: true })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  await page.screenshot({ path: `/tmp/gqw-hotfix-${test.info().project.name}.png`, fullPage: true });
});

/**
 * Browser regressions for the redesigned summaries, charts and contextual explanations.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test, type Page } from '@playwright/test';
import { INFORMATION } from '../src/utils/information.ts';

async function fixtures(page: Page) {
  await page.route('**/api/v1/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v1', '');
    const currency = url.searchParams.get('currency') ?? 'PEN';
    let body: unknown = [];
    if (path === '/profiles/me') body = { id: 'p1', firstName: 'Ana', lastName: 'Torres', countryCode: 'PE', preferredCurrency: 'PEN', monthlyIncome: 1000, lifeCushion: 100, debtLoadThreshold: 7, roles: ['REGISTERED_USER'] };
    if (path === '/budget-statuses/me') body = { currency, period: '2026-11', totalLimit: 100, budgetedConsumption: 120, unbudgetedConsumption: 0, totalConsumption: 120, totalUsage: 120, lines: [{ categoryId: 'c1', categoryName: 'Supermercado', limit: 100, consumption: 120, balance: -20, usage: 120, state: 'EXCEEDED' }] };
    if (path === '/categories') body = [{ id: 'c1', name: 'Supermercado', nature: 'EXPENSE', status: 'ACTIVE' }];
    if (path === '/cash-flows/me') {
      const year = Number(url.searchParams.get('year'));
      const rows = Array.from({ length: 12 }, (_, index) => ({ month: `${year}-${String(index + 1).padStart(2, '0')}`, incomes: currency === 'USD' ? 0 : 100, outflows: currency === 'USD' ? 0 : 150, accountExpenses: currency === 'USD' ? 0 : 150, fixedPaid: 0, cardPayments: 0, pendingCommitments: 0, flow: currency === 'USD' ? 0 : -50, accumulated: currency === 'USD' ? 0 : -50 * (index + 1), projection: index === 11 }));
      body = { year, currency, rows, total: rows[11] };
    }
    await route.fulfill({ json: body });
  });
}

test('the redesigned budget uses the real percentage and keeps compact bars inside their cells', async ({ page }) => {
  await fixtures(page);
  await page.goto('/presupuesto');
  await expect(page.getByRole('img', { name: /Uso del presupuesto/ })).toBeVisible();
  await expect(page.getByText('120.0 %').first()).toBeVisible();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    const bar = page.getByRole('progressbar', { name: 'Uso de Supermercado' });
    const bounds = await bar.boundingBox();
    expect(bounds?.width).toBe(44);
    await expect(bar).toHaveAttribute('aria-valuenow', '100');
  }
  await page.getByRole('button', { name: 'Información sobre Presupuesto', exact: true }).filter({ visible: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Leer el presupuesto' });
  await expect(dialog.locator('p')).toHaveText(INFORMATION.Presupuesto);
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(dialog).toBeHidden();
});

test('cash-flow charts preserve negative server balances and handle an empty currency without invalid paths', async ({ page }) => {
  await fixtures(page);
  await page.goto('/flujo-de-caja');
  await expect(page.getByRole('img', { name: 'Saldo real y proyectado' })).toBeVisible();
  await expect(page.getByRole('table', { name: /Flujo de caja/ })).toContainText('(50.00)');
  expect(await page.getByRole('img', { name: 'Saldo real y proyectado' }).innerHTML()).not.toMatch(/NaN|Infinity/);
  await page.getByRole('button', { name: 'USD · Dólares', exact: true }).click();
  await expect(page.getByText(/Sin movimientos en/)).toBeVisible();
  await expect(page.getByRole('img', { name: 'Saldo real y proyectado' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

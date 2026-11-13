/**
 * Browser regressions using deterministic HTTP fixtures; no database is required.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test, type Page } from '@playwright/test';

const profile = { id: 'p1', firstName: 'Ana María', lastName: 'Torres', countryCode: 'PE', preferredCurrency: 'PEN', monthlyIncome: 1000, lifeCushion: 0, debtLoadThreshold: 7, roles: ['REGISTERED_USER'] };
const dashboard = { currency: 'PEN', accountsBalance: 0, cardsDebt: 0, netPosition: 0, monthIncomes: 0, monthIncomesCount: 0, monthOutflows: { total: 0 }, pendingCommitments: { total: 0, count: 0 }, upcomingDues: [], upcomingCards: [] };
const pageResult = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, totals: [], last: true };

async function fixtures(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v1', '');
    let body: unknown = [];
    if (path === '/profiles/me') body = profile;
    if (path === '/dashboards/me') body = dashboard;
    if (path === '/upcoming-dues/me') body = { overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] };
    if (path === '/budget-statuses/me') body = { lines: [], totalLimit: 0, budgetedConsumption: 0, unbudgetedConsumption: 0, totalConsumption: 0, totalUsage: 0 };
    if (path === '/transactions') body = pageResult;
    if (path === '/ledger-entries') body = { ...pageResult, totalElements: 1, totalPages: 1, content: [{ id: 't1', entryType: 'TRANSFER', title: 'Transferencia', economicDate: '2026-11-10', paymentMethod: { label: 'Cuenta Sueldo con un nombre muy extenso → AhorraMás' }, description: 'Una descripción extensa ' + 'sinseparadores'.repeat(8), amount: 9876543210.99, currency: 'PEN', nature: null, status: 'ACTIVE' }] };
    if (path === '/cash-flows/me') {
      const year = Number(url.searchParams.get('year'));
      const rows = Array.from({ length: 12 }, (_, i) => ({ month: `${year}-${String(i + 1).padStart(2, '0')}`, incomes: 200, outflows: 100, accountExpenses: 50, fixedPaid: 25, cardPayments: 25, flow: 100, accumulated: (i + 1) * 100, pendingCommitments: 10, projection: false }));
      body = { year, currency: url.searchParams.get('currency'), rows, total: rows[11] };
    }
    await route.fulfill({ json: body });
  });
}

test('dashboard greeting and long transfer rows fit all supported widths', async ({ page }) => {
  await fixtures(page);
  await page.goto('/dashboard');
  await expect(page.getByRole('button', { name: 'Información sobre Saldo en cuentas', exact: true })).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) >= 1024) await expect(page.getByRole('heading', { name: 'Hola, Ana María' })).toBeVisible();
  else await expect(page.getByRole('heading', { name: 'Hola, Ana María' })).toHaveCount(0);
  await page.goto('/movimientos');
  const row = page.getByRole('button', { name: /Transferencia.*Cuenta Sueldo/ });
  await expect(row).toBeVisible();
  for (const width of [360, 390, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    const copy = await row.locator('[data-list-copy]').boundingBox();
    const amount = await row.getByText('S/ 9,876,543,210.99', { exact: true }).boundingBox();
    expect(copy).not.toBeNull();
    expect(amount).not.toBeNull();
    if (width < 640) expect(amount!.y).toBeGreaterThanOrEqual(copy!.y + copy!.height);
    if (width === 390) await page.screenshot({ path: '/tmp/gqw-transfer-mobile.png', fullPage: true });
  }
});

test('cash flow helps preserve filters and focus without explanatory intro', async ({ page }) => {
  await fixtures(page);
  await page.goto('/flujo-de-caja');
  const trigger = page.getByRole('button', { name: 'Información sobre Flujo acumulado', exact: true });
  await expect(trigger).toBeVisible();
  await expect(page.getByText(/Ingresos y salidas efectivas, mes a mes/)).toHaveCount(0);
  for (const width of [360, 390, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Flujo acumulado', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  }
});

test('a protected 401 redirects once, while 403 preserves the session', async ({ page }) => {
  await fixtures(page);
  await page.goto('/dashboard');
  await expect(page.getByRole('button', { name: 'Información sobre Saldo en cuentas', exact: true })).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) >= 1024) await expect(page.getByRole('heading', { name: 'Hola, Ana María' })).toBeVisible();
  else await expect(page.getByRole('heading', { name: 'Hola, Ana María' })).toHaveCount(0);
  await page.route('**/api/v1/accounts', (route) => route.fulfill({ status: 403, json: { status: 403 } }));
  // Navigate inside the SPA; a document reload would run a fresh session probe.
  const go = async (name: string) => {
    const menu = page.getByRole('button', { name: 'Abrir menú' });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole('link', { name, exact: true }).click();
  };
  await go('Cuentas');
  await expect(page.getByText('No pudimos cargar tus cuentas')).toBeVisible();
  await expect(page).toHaveURL(/\/cuentas$/);
  await page.route('**/api/v1/accounts', (route) => route.fulfill({ status: 401, json: { status: 401 } }));
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page).toHaveURL(/\/iniciar-sesion$/);
  await expect(page.getByText('Tu sesión venció.', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Inicia sesión nuevamente.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveCount(0);
});

test('category state alternates in place and preserves a pending rename', async ({ page }) => {
  await fixtures(page);
  let active = true;
  let writes = 0;
  let fail = false;
  const category = () => ({ id: 'c1', name: 'Cafeterías', nature: 'EXPENSE', status: active ? 'ACTIVE' : 'INACTIVE' });
  await page.route('**/api/v1/categories**', async (route) => {
    if (route.request().method() === 'POST') {
      writes++;
      if (fail) { await route.fulfill({ status: 500, json: { detail: 'Error' } }); return; }
      active = route.request().url().endsWith('/reactivations');
      await route.fulfill({ status: 201, json: category() });
    } else await route.fulfill({ json: [category()] });
  });
  await page.goto('/categorias');
  for (const width of [360, 390, 402, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Cafeterías', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Nombre', { exact: true }).fill('Nombre pendiente');
    const off = dialog.getByRole('button', { name: 'Desactivar', exact: true });
    const bounds = await off.boundingBox();
    const cancelBounds = await dialog.getByRole('button', { name: 'Cancelar', exact: true }).boundingBox();
    await off.click();
    const on = dialog.getByRole('button', { name: 'Reactivar', exact: true });
    await expect(on).toBeVisible();
    expect(await on.boundingBox()).toEqual(bounds);
    expect(await dialog.getByRole('button', { name: 'Cancelar', exact: true }).boundingBox()).toEqual(cancelBounds);
    await expect(dialog.getByLabel('Nombre', { exact: true })).toHaveValue('Nombre pendiente');
    await expect(off).toHaveCount(0);
    await page.mouse.move(1, 1);
    await expect(on).toHaveCSS('background-color', width >= 1024 ? 'rgb(67, 56, 202)' : 'rgb(238, 240, 254)');
    if (width === 402 || width === 1440) await page.screenshot({ path: `/tmp/gqw-category-inactive-${width}.png` });
    await on.click();
    await expect(off).toBeVisible();
    expect(await off.boundingBox()).toEqual(bounds);
    await page.mouse.move(1, 1);
    await expect(off).toHaveCSS('background-color', 'rgb(201, 42, 57)');
    if (width === 402 || width === 1440) await page.screenshot({ path: `/tmp/gqw-category-active-${width}.png` });
    await expect(dialog.getByLabel('Nombre', { exact: true })).toHaveValue('Nombre pendiente');
    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page.getByText('Activas · 1', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  }
  expect(writes).toBe(12);
  await page.getByRole('button', { name: 'Cafeterías', exact: true }).click();
  fail = true;
  await page.getByRole('dialog').getByRole('button', { name: 'Desactivar', exact: true }).click();
  await expect(page.getByText('No pudimos guardar la categoría. Inténtalo de nuevo.')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Desactivar', exact: true })).toBeVisible();
});

test('table columns keep separation and scroll inside the card on narrow screens', async ({ page }) => {
  await fixtures(page);
  await page.route('**/api/v1/debt-loads/me?**', (route) => route.fulfill({ json: {
    year: 2026, currency: 'PEN', threshold: 7,
    months: Array.from({ length: 12 }, (_, i) => ({ month: `2026-${String(i + 1).padStart(2, '0')}`, debtPayments: i < 3 ? 789 : 0, incomes: i === 0 ? 41724 : i === 1 ? 7500 : 0, load: i === 0 ? 1.89 : i === 1 ? 10.52 : null, overThreshold: i === 1 })),
  } }));
  await page.goto('/flujo-de-caja/carga-de-deuda');
  const table = page.getByRole('table', { name: 'Carga de deuda por mes' });
  await expect(table).toBeVisible();
  for (const width of [360, 390, 640, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1100 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    const measurements = await table.evaluate((node) => {
      const row = node.querySelector('tbody tr')!;
      const ranges = [...row.querySelectorAll('td')].map((cell) => {
        const range = document.createRange(); range.selectNodeContents(cell); const rect = range.getBoundingClientRect(); return { left: rect.left, right: rect.right };
      });
      return ranges.slice(1).map((cell, index) => cell.left - ranges[index].right);
    });
    expect(Math.min(...measurements)).toBeGreaterThanOrEqual(24);
    if (width < 640) expect(await page.getByRole('region', { name: 'Carga de deuda por mes' }).evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  }
});

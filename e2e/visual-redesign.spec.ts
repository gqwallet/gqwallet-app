/**
 * Browser regressions for the redesigned summaries, charts and contextual explanations.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test, type Page } from '@playwright/test';
import { INFORMATION } from '../src/utils/information.ts';

async function fixtures(page: Page, firstActiveMonth = 1, reviewCount = 1) {
  await page.route('**/api/v1/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v1', '');
    const currency = url.searchParams.get('currency') ?? 'PEN';
    let body: unknown = [];
    if (path === '/profiles/me') body = { id: 'p1', firstName: 'Ana', lastName: 'Torres', countryCode: 'PE', preferredCurrency: 'PEN', monthlyIncome: 1000, lifeCushion: 100, debtLoadThreshold: 7, roles: ['REGISTERED_USER'] };
    if (path === '/budget-statuses/me') body = { currency, period: '2026-11', totalLimit: 100, budgetedConsumption: 120, unbudgetedConsumption: 0, totalConsumption: 120, totalUsage: 120, lines: Array.from({ length: reviewCount }, (_, index) => ({ categoryId: `c${index}`, categoryName: index === 0 ? 'Supermercado' : `Categoría de nombre bastante largo ${index}`, limit: 100, consumption: reviewCount === 1 ? 120 : index === 0 ? 92 : 125.6, balance: reviewCount === 1 ? -20 : index === 0 ? 8 : -25.6, usage: reviewCount === 1 ? 120 : index === 0 ? 92 : 125.6, state: index === 0 && reviewCount > 1 ? 'ATTENTION' : 'EXCEEDED' })) };
    if (path === '/dashboards/me') body = { currency, accountsBalance: 1000, cardsDebt: 0, netPosition: 1000, monthIncomes: 1000, monthIncomesCount: 1, monthOutflows: { accountExpenses: 120, fixedPaid: 0, cardPayments: 0, total: 120 }, pendingCommitments: { dues: 0, cards: 0, total: 0, count: 0 }, upcomingDues: [], upcomingCards: [] };
    if (path === '/upcoming-dues/me') body = { overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] };
    if (path === '/transactions') body = { content: [], totalElements: 1, totalPages: 1, number: 0, size: 1, last: true };
    if (path === '/categories') body = [{ id: 'c1', name: 'Supermercado', nature: 'EXPENSE', status: 'ACTIVE' }];
    if (path === '/cash-flows/me') {
      const year = Number(url.searchParams.get('year'));
      const rows = Array.from({ length: 12 }, (_, index) => ({ month: `${year}-${String(index + 1).padStart(2, '0')}`, incomes: currency === 'USD' || index + 1 < firstActiveMonth ? 0 : 100, outflows: currency === 'USD' || index + 1 < firstActiveMonth ? 0 : 150, accountExpenses: currency === 'USD' || index + 1 < firstActiveMonth ? 0 : 150, fixedPaid: 0, cardPayments: 0, pendingCommitments: 0, flow: currency === 'USD' || index + 1 < firstActiveMonth ? 0 : -50, accumulated: currency === 'USD' || index + 1 < firstActiveMonth ? 0 : -50 * (index + 1), projection: index === 11 }));
      body = { year, currency, rows, total: rows[11] };
    }
    await route.fulfill({ json: body });
  });
}

test('the redesigned budget uses the real percentage and keeps compact bars inside their cells', async ({ page }) => {
  await fixtures(page);
  await page.goto('/presupuesto');
  await expect(page.getByRole('img', { name: 'Con presupuesto' })).toBeVisible();
  await expect(page.getByText('120.0 %').first()).toBeVisible();
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    const bar = page.getByRole('progressbar', { name: 'Uso de Supermercado' });
    const bounds = await bar.boundingBox();
    // Device-scale subpixel layout can report 43.9999 px; round to 0.01 px without accepting another width.
    expect(Math.round((bounds?.width ?? 0) * 100) / 100).toBe(44);
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

test('cash-flow charts start in the first active month and support exact keyboard and pointer selection without overflow', async ({ page }) => {
  await fixtures(page, 11);
  await page.goto('/flujo-de-caja');
  const chart = page.getByRole('slider', { name: 'Explorar saldo mensual' });
  await expect(chart).toHaveAttribute('aria-valuetext', 'Noviembre · −S/ 550.00');
  expect(await page.locator('[data-cash-month]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-cash-month')?.slice(5)))).toEqual(['11', '12', '11', '12']);
  const bubble = page.locator('[data-current-balance-bubble]');
  for (const width of [360, 402, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await chart.focus();
    await page.keyboard.press('End');
    await expect(bubble).toHaveText('Diciembre · −S/ 600.00 · proyección*');
    await page.keyboard.press('ArrowLeft');
    await expect(bubble).toHaveText('Noviembre · −S/ 550.00');
    const bounds = (await chart.boundingBox())!;
    if (test.info().project.name === 'mobile') {
      await page.touchscreen.tap(bounds.x + bounds.width * 0.9, bounds.y + 70);
      await expect(chart).toHaveCSS('touch-action', 'pan-y');
    } else {
      await page.mouse.move(bounds.x + bounds.width * 0.9, bounds.y + 70);
    }
    await expect(bubble).toHaveText('Diciembre · −S/ 600.00 · proyección*');
    const tooltip = (await bubble.boundingBox())!;
    expect(tooltip.x).toBeGreaterThanOrEqual(bounds.x - 0.01);
    expect(tooltip.x + tooltip.width).toBeLessThanOrEqual(bounds.x + bounds.width + 0.01);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  }
});

test('budget warnings show three state pills and the remainder and desktop information stays beside the greeting', async ({ page }) => {
  await fixtures(page, 1, 5);
  await page.goto('/dashboard');
  const list = page.getByRole('list', { name: 'Categorías por revisar' });
  await expect(page.getByText('Revisa 5 categorías')).toBeVisible();
  await expect(list.getByRole('listitem')).toHaveCount(4);
  await expect(list.getByText('y 2 más')).toBeVisible();
  await expect(list.getByText('Atención · 92.0 %')).toBeVisible();
  await expect(list.getByText('Excedido · 125.6 %')).toHaveCount(2);
  for (const width of [360, 402, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    const greeting = page.getByRole('heading', { name: 'Hola, Ana' });
    if (width < 1024) await expect(greeting).toHaveCount(0);
    else {
      const heading = (await greeting.boundingBox())!;
      const info = (await page.getByRole('button', { name: 'Información sobre Dashboard', exact: true }).filter({ visible: true }).boundingBox())!;
      expect(info.x - heading.x - heading.width).toBeCloseTo(12, 0);
      expect(info.y + info.height / 2).toBeCloseTo(heading.y + heading.height / 2, 0);
      expect(info.width).toBe(44);
      expect(info.height).toBe(44);
    }
  }
  await page.getByRole('button', { name: 'Ver presupuesto' }).last().click();
  await expect(page).toHaveURL(/\/presupuesto$/);
});

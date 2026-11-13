/**
 * Browser regressions for the dashboard and budget summaries and the report filters: whole-word
 * headings and breakdown rows, usage ring label inside its ring, one divided block per card, a usage column clear of
 * the balance and no redundant helper.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test, type Page } from '@playwright/test';

const CARDS = [
  { cardId: 'c1', name: 'Bfree', currency: 'PEN', paymentDueDate: '2026-12-05', billingDate: '2026-11-10', color: '#4338CA', amountDue: 525.96, status: 'PENDING' },
  { cardId: 'c2', name: 'CMR', currency: 'PEN', paymentDueDate: '2026-12-20', billingDate: '2026-11-24', color: '#0D9488', amountDue: 116.14, status: 'PENDING' },
];

async function fixtures(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v1', '');
    let body: unknown = [];
    if (path === '/profiles/me') body = { id: 'p1', firstName: 'Ana', lastName: 'Torres', countryCode: 'PE', preferredCurrency: 'PEN', monthlyIncome: 1000, lifeCushion: 100, debtLoadThreshold: 7, roles: ['REGISTERED_USER'] };
    if (path === '/dashboards/me') {
      body = {
        currency: 'PEN', accountsBalance: 2500, cardsDebt: 825.1, netPosition: 1674.9, monthIncomes: 3200, monthIncomesCount: 2,
        monthOutflows: { accountExpenses: 400, fixedPaid: 132.65, cardPayments: 0, total: 532.65 },
        pendingCommitments: { dues: 100, cards: 642.1, total: 742.1, count: 3 },
        budgetUsage: { totalUsage: 44, unbudgetedConsumption: 631.45 }, upcomingDues: [], upcomingCards: CARDS,
      };
    }
    if (path === '/upcoming-dues/me') body = { overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] };
    if (path === '/budget-statuses/me') {
      const unbudgeted = ['Pareja', 'Mascotas', 'Salud', 'Regalos'].map((name, index) => ({ categoryId: `u${index}`, categoryName: name, limit: null, consumption: 150, balance: null, usage: null, state: 'NO_BUDGET' }));
      body = { currency: 'PEN', period: '2026-11', totalLimit: 1260, budgetedConsumption: 553.98, unbudgetedConsumption: 631.45, totalConsumption: 1185.43, totalUsage: 44, lines: [{ categoryId: 'b1', categoryName: 'Supermercado', limit: 1260, consumption: 553.98, balance: 706.02, usage: 44, state: 'NORMAL' }, ...unbudgeted] };
    }
    if (path === '/cards') body = CARDS.map((card) => ({ id: card.cardId, name: card.name, currency: card.currency }));
    if (path === '/cards/c1/credit-line-usage') body = { cardId: 'c1', currency: 'PEN', creditLine: 1000, used: 708.96, available: 291.04, creditBalance: 0 };
    if (path === '/cards/c2/credit-line-usage') body = { cardId: 'c2', currency: 'PEN', creditLine: 1100, used: 116.14, available: 983.86, creditBalance: 0 };
    if (path === '/transactions') body = { content: [], totalElements: 1, totalPages: 1, number: 0, size: 1 };
    await route.fulfill({ json: body });
  });
}

test('the dashboard budget summary keeps whole words and the percentage inside its ring', async ({ page }) => {
  await fixtures(page);
  await page.goto('/dashboard');
  const heading = page.getByText('Con presupuesto', { exact: true });
  await expect(heading).toBeVisible();
  const unbudgeted = page.getByText('S/ 631.45 · 4 categorías', { exact: true });
  await expect(unbudgeted).toBeVisible();
  for (const width of [360, 390, 402, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect((await heading.boundingBox())!.height, `heading wraps at ${width}px`).toBeLessThanOrEqual(22);
    // Each breakdown figure stays on one line next to its label.
    expect((await unbudgeted.boundingBox())!.height, `breakdown wraps at ${width}px`).toBeLessThanOrEqual(18);
    const label = (await page.getByText('Sin presupuesto', { exact: true }).first().boundingBox())!;
    expect(Math.abs(label.y - (await unbudgeted.boundingBox())!.y), `breakdown splits at ${width}px`).toBeLessThanOrEqual(2);
    const ring = (await page.getByRole('img', { name: 'Con presupuesto' }).boundingBox())!;
    // Measures the rendered text itself: its element stretches over the whole ring.
    const labelWidth = await page.getByRole('img', { name: 'Con presupuesto' }).getByText('44.0 %').evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().width;
    });
    // The label must fit inside the ring opening (75 % of its diameter).
    expect(labelWidth, `ring label overflows at ${width}px`).toBeLessThanOrEqual(ring.width * 0.75);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  }
});

test('each dashboard card keeps its line usage in its own divided block', async ({ page }) => {
  await fixtures(page);
  await page.goto('/dashboard');
  const firstBar = page.getByRole('progressbar', { name: 'Línea utilizada de Bfree' });
  await expect(firstBar).toBeVisible();
  for (const width of [360, 402, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const items = page.getByRole('listitem').filter({ has: page.getByRole('progressbar', { name: /Línea utilizada de/ }) });
    await expect(items).toHaveCount(2);
    const bar = (await firstBar.boundingBox())!;
    const next = (await items.nth(1).getByText('CMR', { exact: true }).boundingBox())!;
    expect(next.y - (bar.y + bar.height), `cards touch at ${width}px`).toBeGreaterThanOrEqual(20);
    expect(await items.nth(0).evaluate((element) => getComputedStyle(element).borderBottomWidth)).toBe('1px');
  }
});

test('the report filters align without the redundant currency helper', async ({ page }) => {
  await fixtures(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/reportes');
  const period = page.getByLabel('Periodo');
  const currency = page.getByLabel('Moneda');
  await expect(currency).toBeVisible();
  await expect(page.getByText(/Obligatoria\. Por defecto/)).toHaveCount(0);
  // The select sits inside its bordered box; compare the visible boxes of both controls.
  const [a, b] = [(await period.boundingBox())!, (await currency.locator('xpath=..').boundingBox())!];
  expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(a.height - b.height)).toBeLessThanOrEqual(1);
});

test('the budget table keeps the usage bar and percentage clear of the balance', async ({ page }) => {
  await fixtures(page);
  await page.goto('/presupuesto');
  const table = page.getByRole('table', { name: /Presupuesto de/ });
  const row = table.getByRole('row', { name: /Supermercado/ });
  await expect(row).toBeVisible();
  await expect(page.getByRole('img', { name: 'Con presupuesto' })).toBeVisible();
  for (const width of [360, 402, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const cells = row.getByRole('cell');
    const balance = await cells.nth(3).evaluate((cell) => { const range = document.createRange(); range.selectNodeContents(cell); return range.getBoundingClientRect().right; });
    const bar = (await row.getByRole('progressbar').boundingBox())!;
    expect(bar.x - balance, `usage touches the balance at ${width}px`).toBeGreaterThanOrEqual(40);
    const percentage = row.getByText('44.0 %');
    expect((await percentage.boundingBox())!.height).toBeLessThanOrEqual(22);
    // Rows without a bar end at the same right edge as rows with one.
    const subtotal = table.getByRole('row', { name: /Subtotal con presupuesto/ }).getByText('44.0 %');
    const edges = await Promise.all([percentage, subtotal].map(async (item) => { const box = (await item.boundingBox())!; return box.x + box.width; }));
    expect(Math.abs(edges[0] - edges[1])).toBeLessThanOrEqual(1);
  }
});

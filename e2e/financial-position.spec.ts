/**
 * Financial position, cash-basis outflows, budget split and payable opening debt.
 * Runs unchanged on the desktop and 402 px mobile projects against the real API.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { chooseCategory, signUp, uniqueEmail } from './helpers.ts';

interface Card {
  id: string;
  openingDebts: { amount: number | string; closingDate: string }[];
}
interface PaymentCycle {
  closingDate: string;
  amountDue: number | string;
  paid: number | string;
}
interface CashFlow {
  rows: { month: string; outflows: number | string; accumulated: number | string }[];
}
interface NetPosition {
  cardsDebt: number | string;
  netPosition: number | string;
}
interface Dashboard extends NetPosition {
  monthOutflows: { total: number | string; cardPayments: number | string };
}

const API = (process.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '') + '/api/v1';

function todayIso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function stat(page: Page, label: string) {
  return page.locator('[data-stat-card]').filter({ has: page.getByText(label, { exact: true }) });
}

async function getResource<T>(page: Page, path: string): Promise<T> {
  const response = await page.request.get(`${API}${path}`);
  expect(response.ok(), `${path}: ${response.status()}`).toBeTruthy();
  return response.json() as Promise<T>;
}

async function assertKpiAlignment(page: Page, count: number, name: string, info: TestInfo) {
  await expect(page.locator('[data-stat-card]')).toHaveCount(count);
  await page.evaluate(() => document.fonts.ready);
  const rows = new Map<number, Array<{ height: number; valueY: number }>>();
  for (const card of await page.locator('[data-stat-card]').all()) {
    const box = await card.boundingBox();
    const value = await card.locator('[data-stat-value]').boundingBox();
    expect(box).not.toBeNull();
    expect(value).not.toBeNull();
    if (!box || !value) throw new Error('Missing KPI bounding box');
    const top = Math.round(box.y);
    rows.set(top, [...(rows.get(top) ?? []), { height: box.height, valueY: value.y }]);
  }
  const columns = info.project.name === 'mobile' ? 2 : name === 'budget' ? 4 : 3;
  expect(rows.size).toBe(Math.ceil(count / columns));
  expect([...rows.values()].some((row) => row.length > 1)).toBeTruthy();
  for (const row of rows.values()) {
    for (const item of row) {
      expect(Math.abs(item.valueY - row[0].valueY), `${name}: value alignment`).toBeLessThanOrEqual(1);
      expect(Math.abs(item.height - row[0].height), `${name}: equal card heights`).toBeLessThanOrEqual(1);
    }
  }
  await info.attach(`${name}-${info.project.name}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
}

async function createAccount(page: Page) {
  await page.goto('/cuentas/nueva');
  await page.getByLabel('Alias', { exact: true }).fill('Cuenta principal');
  await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'BCP' });
  await page.getByLabel('Saldo inicial', { exact: true }).fill('1000');
  await page.getByRole('button', { name: 'Guardar cuenta' }).click();
  await expect(page.getByText('Cuenta registrada', { exact: true })).toBeVisible();
}

async function prepareCard(page: Page, name: string) {
  await page.goto('/tarjetas/nueva');
  await page.getByLabel('Nombre', { exact: true }).fill(name);
  await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'Interbank' });
  await page.getByLabel('Línea de crédito', { exact: true }).fill('5000');
  await page.getByLabel('Día de facturación', { exact: true }).selectOption('1');
  await page.getByLabel('Día de pago', { exact: true }).selectOption('2');
}

async function saveCard(page: Page): Promise<Card> {
  const response = page.waitForResponse((result) => result.url().endsWith('/api/v1/cards') && result.request().method() === 'POST');
  await page.getByRole('button', { name: 'Guardar tarjeta' }).click();
  const registration = await response;
  expect(registration.ok()).toBeTruthy();
  await expect(page.getByText('Tarjeta registrada', { exact: true })).toBeVisible();
  return registration.json() as Promise<Card>;
}

async function purchase(page: Page, amount: string, category: string, method: string) {
  await page.goto('/movimientos/nuevo');
  await page.getByLabel('Importe', { exact: true }).fill(amount);
  await chooseCategory(page, category);
  await page.getByLabel('Medio de pago', { exact: true }).selectOption({ label: method });
  await page.getByRole('button', { name: 'Guardar gasto' }).click();
  await expect(page.getByText('Gasto registrado', { exact: true })).toBeVisible();
}

test('net position, breakdown, cash-basis outflows and budget split', async ({ page }, info) => {
  await signUp(page, uniqueEmail('net-position'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  await createAccount(page);
  await prepareCard(page, 'Visa flujo');
  const card = await saveCard(page);

  await page.goto('/presupuesto');
  await page.getByRole('button', { name: 'Definir límite', exact: true }).first().click();
  const limit = page.getByRole('dialog', { name: 'Definir límite' });
  await limit.getByLabel('Categoría', { exact: true }).selectOption({ label: 'Supermercado' });
  await limit.getByLabel('Límite', { exact: true }).fill('1000');
  await limit.getByRole('button', { name: 'Guardar límite' }).click();
  await expect(limit).not.toBeVisible();

  const before = await getResource<Dashboard>(page, '/dashboards/me?currency=PEN');
  await purchase(page, '200', 'Supermercado', 'Visa flujo · PEN');
  const afterPurchase = await getResource<Dashboard>(page, '/dashboards/me?currency=PEN');
  expect(Number(afterPurchase.monthOutflows.total)).toBe(Number(before.monthOutflows.total));
  expect(Number(afterPurchase.cardsDebt)).toBe(200);
  await purchase(page, '50', 'Comida y restaurantes', 'Cuenta principal · PEN');

  await page.goto('/dashboard');
  await expect(stat(page, 'Saldo en cuentas')).toContainText('S/ 950.00');
  await expect(stat(page, 'Deuda de tarjetas')).toContainText('S/ 200.00');
  await expect(stat(page, 'Posición neta')).toContainText('S/ 750.00');
  await expect(stat(page, 'Salidas')).toContainText('S/ 50.00');
  await expect(page.getByText('S/ 50.00 sin presupuesto', { exact: true })).toBeVisible();
  await assertKpiAlignment(page, 6, 'dashboard', info);
  await page.getByRole('button', { name: /Posición neta.*Ver desglose/ }).click();
  await expect(page).toHaveURL(/dashboard\/posicion-neta\?moneda=PEN$/);
  await expect(page.getByRole('heading', { name: 'Posición neta', exact: true })).toBeVisible();
  await expect(page.getByText('Cuenta principal', { exact: true })).toBeVisible();
  await expect(page.getByText('Visa flujo', { exact: true })).toBeVisible();
  await expect(stat(page, 'Posición neta')).toContainText('S/ 750.00');
  await expect(page.getByRole('heading', { name: 'Compromisos próximos' })).toBeVisible();
  await page.goto('/dashboard/disponible?moneda=USD');
  await expect(page).toHaveURL(/dashboard\/posicion-neta\?moneda=USD$/);
  await expect(page.getByLabel('Moneda', { exact: true })).toHaveValue('USD');

  await page.goto('/presupuesto');
  await expect(stat(page, 'Gastado con presupuesto')).toContainText('S/ 200.00');
  await expect(stat(page, 'Gastado con presupuesto')).toContainText('20');
  await expect(stat(page, 'Gastado sin presupuesto')).toContainText('S/ 50.00');
  await expect(stat(page, 'Total gastado')).toContainText('S/ 250.00');
  const budget = page.getByRole('table', { name: /Presupuesto de/ });
  await expect(budget.getByText('Con presupuesto', { exact: true })).toBeVisible();
  await expect(budget.getByRole('cell', { name: 'Sin presupuesto', exact: true }).first()).toBeVisible();
  await expect(budget.getByRole('row', { name: /Subtotal con presupuesto/ })).toContainText('200.00');
  await expect(budget.getByRole('row', { name: /Subtotal sin presupuesto/ })).toContainText('50.00');
  await assertKpiAlignment(page, 4, 'budget', info);

  const today = todayIso();
  const flowBefore = await getResource<CashFlow>(page, `/cash-flows/me?year=${today.slice(0, 4)}&currency=PEN`);
  expect(Number(flowBefore.rows.find((row) => row.month === today.slice(0, 7))?.outflows)).toBe(50);
  await page.goto('/transferencias/nueva');
  await page.getByRole('group', { name: 'Tipo de transferencia' }).getByRole('button', { name: 'Pago de tarjeta' }).click();
  await page.getByLabel('Tarjeta a pagar', { exact: true }).selectOption({ label: 'Visa flujo · PEN' });
  await expect(page.getByLabel('Importe', { exact: true })).toHaveValue('200.00');
  const transfer = page.waitForResponse((result) => result.url().endsWith('/transfers') && result.request().method() === 'POST');
  await page.getByRole('button', { name: 'Registrar pago', exact: true }).click();
  const paid = await transfer;
  expect(paid.ok()).toBeTruthy();
  expect(paid.request().postDataJSON()).toMatchObject({ targetId: card.id, cycleClosingDate: expect.any(String) });
  await expect(page.getByText('Pago de tarjeta registrado', { exact: true })).toBeVisible();
  const afterPayment = await getResource<Dashboard>(page, '/dashboards/me?currency=PEN');
  expect(Number(afterPayment.monthOutflows.cardPayments)).toBe(200);
  expect(Number(afterPayment.monthOutflows.total)).toBe(250);
  expect(Number(afterPayment.netPosition)).toBe(750);

  await page.goto('/flujo-de-caja');
  const matrix = page.getByRole('table', { name: /Flujo de caja/ });
  await expect(matrix.getByText('Salidas efectivas', { exact: true })).toBeVisible();
  await expect(matrix.getByRole('row', { name: /^Pagos de tarjeta/ })).toContainText('200.00');
  await expect(matrix.getByRole('row', { name: /^Compromisos pendientes/ })).toHaveClass(/italic/);
  await assertKpiAlignment(page, 3, 'cash-flow', info);
  const flowAfter = await getResource<CashFlow>(page, `/cash-flows/me?year=${today.slice(0, 4)}&currency=PEN`);
  const month = flowAfter.rows.find((row) => row.month === today.slice(0, 7));
  expect(Number(month?.outflows)).toBe(250);
  expect(Number(month?.accumulated)).toBe(750);
});

test('opening debt in two cycles, overdue partial payment and completion', async ({ page }, info) => {
  await signUp(page, uniqueEmail('opening-cycles'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  await createAccount(page);
  await prepareCard(page, 'Visa anterior');
  await page.getByRole('button', { name: 'Agregar otra facturación' }).click();
  await page.getByLabel('Monto 1', { exact: true }).fill('100');
  const today = todayIso();
  const options = await page.getByLabel('Facturación 1', { exact: true }).locator('option').evaluateAll((items) => items.map((item) => (item as HTMLOptionElement).value).filter(Boolean));
  const closed = options.filter((date) => date < `${today.slice(0, 7)}-01`).at(-1);
  const current = options.at(-1);
  expect(closed).toBeDefined();
  expect(current).toBeDefined();
  await page.getByLabel('Facturación 1', { exact: true }).selectOption(closed!);
  await page.getByRole('button', { name: 'Agregar otra facturación' }).click();
  await page.getByLabel('Monto 2', { exact: true }).fill('80');
  await page.getByLabel('Facturación 2', { exact: true }).selectOption(current!);
  const card = await saveCard(page);
  expect(card.openingDebts).toHaveLength(2);
  expect(card.openingDebts.map((debt) => Number(debt.amount))).toEqual([100, 80]);
  const position = await getResource<NetPosition>(page, '/net-positions/me?currency=PEN');
  expect(Number(position.cardsDebt)).toBe(180);
  expect(Number(position.netPosition)).toBe(820);
  const summary = await getResource<Dashboard>(page, '/dashboards/me?currency=PEN');
  expect(Number(summary.monthOutflows.total)).toBe(0);
  await expect(page.getByText('Vencida · pagar', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ver detalle', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Facturaciones pendientes' })).toBeVisible();
  await expect(page.getByText('Vencida', { exact: true })).toBeVisible();
  await expect(page.getByText('Deuda inicial', { exact: true }).locator('..')).toContainText('S/ 180.00');
  await assertKpiAlignment(page, 3, 'card-detail', info);

  for (const [amount, remaining, totalPaid] of [['40', 60, 40], ['60', 0, 100]] as const) {
    await page.getByRole('button', { name: 'Pagar tarjeta', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Pagar Visa anterior' });
    await expect(dialog.getByLabel('Facturación', { exact: true })).toHaveValue(closed!);
    await expect(dialog.getByLabel('Importe', { exact: true })).toHaveValue(amount === '40' ? '100.00' : '60.00');
    await expect(dialog.getByText('Puedes pagar una parte; el saldo queda pendiente', { exact: true })).toBeVisible();
    await dialog.getByLabel('Importe', { exact: true }).fill(amount);
    const transfer = page.waitForResponse((result) => result.url().endsWith('/transfers') && result.request().method() === 'POST');
    await dialog.getByRole('button', { name: 'Registrar pago' }).click();
    const response = await transfer;
    expect(response.ok()).toBeTruthy();
    expect(response.request().postDataJSON()).toMatchObject({ cycleClosingDate: closed, amount: Number(amount) });
    await expect(dialog).not.toBeVisible();
    const cycles = await getResource<PaymentCycle[]>(page, `/cards/${card.id}/payment-cycles`);
    const previous = cycles.find((cycle) => cycle.closingDate === closed);
    if (remaining > 0) {
      expect(Number(previous?.amountDue)).toBe(remaining);
      expect(Number(previous?.paid)).toBe(totalPaid);
      await expect(page.getByText('Pagado S/ 40.00 de S/ 100.00', { exact: true })).toBeVisible();
      await page.goto('/tarjetas');
      await expect(page.getByText('Parcial · falta S/ 60.00', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Ver detalle', exact: true }).click();
    } else {
      expect(Number(previous?.amountDue ?? 0)).toBe(0);
      await expect(page.getByText('Pagado S/ 40.00 de S/ 100.00', { exact: true })).not.toBeVisible();
      await page.getByRole('button', { name: 'Pagar tarjeta', exact: true }).click();
      await expect(page.getByRole('dialog').getByLabel('Facturación', { exact: true })).toHaveValue(current!);
      await expect(page.getByRole('dialog').getByLabel('Importe', { exact: true })).toHaveValue('80.00');
      await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
    }
  }
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(page.getByLabel('Monto 1', { exact: true })).toHaveValue('100.00');
  await expect(page.getByLabel('Facturación 1', { exact: true })).toHaveValue(closed!);
  await expect(page.getByLabel('Monto 2', { exact: true })).toHaveValue('80.00');
  await expect(page.getByLabel('Facturación 2', { exact: true })).toHaveValue(current!);
  await page.goto('/presupuesto');
  await expect(stat(page, 'Total gastado')).toContainText('S/ 0.00');
});

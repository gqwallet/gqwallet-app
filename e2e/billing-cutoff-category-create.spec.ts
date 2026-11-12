/**
 * Real-API regressions for effective closing dates and category creation across tabs.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
import { chooseCategory, signUp, uniqueEmail } from './helpers.ts';

const API = 'http://localhost:8080/api/v1';

test('purchase time uses the effective month-end close and preserves cut-off boundaries', async ({ page }) => {
  await signUp(page, uniqueEmail('closing-month-end'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  const response = await page.request.post(`${API}/cards`, { data: {
    name: 'Cierre 31', currency: 'PEN', customBankName: 'Banco de prueba', creditLine: 1000,
    billingDate: '2026-10-31', paymentDueDate: '2026-11-05', billingCutoffTime: '18:00', color: '#3333b2', openingDebts: [],
  } });
  expect(response.ok()).toBeTruthy();
  const card = await response.json();
  for (const scenario of [
    { date: '2026-11-30', time: '17:55', closing: '2026-11-30' },
    { date: '2026-11-30', time: '18:00', closing: '2026-11-30' },
    { date: '2026-11-30', time: '18:05', closing: '2026-12-31' },
    { date: '2026-11-30', time: '', closing: '2026-11-30' },
    { date: '2026-10-31', time: '19:00', closing: '2026-11-30' },
    { date: '2026-11-29', time: null, closing: '2026-11-30' },
  ]) {
    await page.goto('/movimientos/nuevo');
    await page.getByLabel('Importe', { exact: true }).fill('10');
    await chooseCategory(page, 'Cafeterías');
    await page.getByLabel('Fecha económica', { exact: true }).fill(scenario.date);
    await page.getByLabel('Medio de pago', { exact: true }).selectOption(`CARD:${card.id}`);
    const time = page.getByRole('group', { name: 'Hora del consumo', exact: true });
    if (scenario.time === null) await expect(time).toHaveCount(0);
    else {
      await expect(time).toBeVisible();
      const [hour = '', minute = ''] = scenario.time.split(':');
      await page.getByLabel('Hora del consumo', { exact: true }).selectOption(hour);
      if (hour) await page.getByLabel('Minutos', { exact: true }).selectOption(minute);
    }
    const pending = page.waitForResponse((r) => r.request().method() === 'POST' && r.url() === `${API}/transactions`);
    await page.getByRole('button', { name: 'Guardar gasto', exact: true }).click();
    const saved = await pending;
    expect(saved.status()).toBe(201);
    expect(saved.request().postDataJSON().cycleClosingDate).toBe(scenario.closing);
    expect(saved.request().postDataJSON()).not.toHaveProperty('purchaseTime');
    const transaction = await saved.json();
    expect(transaction.cycleClosingDate).toBe(scenario.closing);
    const persisted = await page.request.get(`${API}/transactions/${transaction.id}`);
    expect((await persisted.json()).cycleClosingDate).toBe(scenario.closing);
  }
});

test('category creation respects the form nature and preserves input after a duplicate error', async ({ page }) => {
  await signUp(page, uniqueEmail('category-create-nature'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  await page.goto('/categorias');
  await page.getByRole('button', { name: 'Nueva categoría', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Nueva categoría', exact: true });
  await dialog.getByLabel('Nombre', { exact: true }).fill('Sueldo');
  await dialog.getByRole('button', { name: 'Ingreso', exact: true }).click();
  await dialog.getByRole('button', { name: 'Crear categoría', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Ya tienes una categoría');
  await expect(dialog.getByLabel('Nombre', { exact: true })).toHaveValue('Sueldo');
  await expect(dialog.getByRole('button', { name: 'Ingreso', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Naturaleza', exact: true }).first().getByRole('button', { name: 'Gasto', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const scenario of [
    { name: 'Bono de prueba', type: 'Ingreso', nature: 'INCOME' },
    { name: 'Salida de prueba', type: 'Gasto', nature: 'EXPENSE' },
    { name: 'Otra salida de prueba', type: 'Gasto', nature: 'EXPENSE' },
  ]) {
    await dialog.getByLabel('Nombre', { exact: true }).fill(scenario.name);
    await dialog.getByRole('button', { name: scenario.type, exact: true }).click();
    await dialog.getByRole('button', { name: /Crear categoría|Corregir nombre/ }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText(scenario.name, { exact: true })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Naturaleza', exact: true }).getByRole('button', { name: scenario.type, exact: true })).toHaveAttribute('aria-pressed', 'true');
    const list = await (await page.request.get(`${API}/categories?nature=${scenario.nature}`)).json();
    expect(list.filter((c: { name: string }) => c.name === scenario.name)).toHaveLength(1);
    expect(list.find((c: { name: string }) => c.name === scenario.name).nature).toBe(scenario.nature);
    await page.getByRole('button', { name: 'Nueva categoría', exact: true }).click();
    dialog = page.getByRole('dialog', { name: 'Nueva categoría', exact: true });
  }
});

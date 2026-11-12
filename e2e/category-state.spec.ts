/**
 * Category state persistence and selector availability against the real API.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
import { signUp, uniqueEmail } from './helpers.ts';

const API = 'http://localhost:8080/api/v1';

test('category toggle preserves history, identity and a pending name across real writes', async ({ page }) => {
  await signUp(page, uniqueEmail('category-toggle'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  const categories = await (await page.request.get(`${API}/categories?nature=EXPENSE`)).json();
  const category = categories.find((item: { name: string }) => item.name === 'Cafeterías');
  const created = await page.request.post(`${API}/transactions`, { data: { nature: 'EXPENSE', amount: 12, currency: 'PEN', categoryId: category.id, economicDate: '2026-11-11' } });
  expect(created.ok()).toBeTruthy();
  const history = await (await page.request.get(`${API}/transactions?categoryId=${category.id}`)).json();
  await page.goto('/categorias');
  await page.getByRole('button', { name: 'Cafeterías', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Categoría de gasto · 1 movimientos', { exact: true })).toBeVisible();
  await dialog.getByLabel('Nombre', { exact: true }).fill('Nombre sin guardar');
  await dialog.getByRole('button', { name: 'Desactivar', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Reactivar', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  let stored = await (await page.request.get(`${API}/categories?nature=EXPENSE`)).json();
  expect(stored.find((item: { id: string }) => item.id === category.id)).toMatchObject({ ...category, status: 'INACTIVE' });
  await page.goto('/movimientos/nuevo');
  await page.getByRole('button', { name: /Categoría/ }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Cafeterías', exact: true })).toHaveCount(0);
  await page.goto('/categorias');
  await page.getByRole('button', { name: /Cafeterías.*No se ofrece/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reactivar', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Desactivar', exact: true })).toBeVisible();
  stored = await (await page.request.get(`${API}/categories?nature=EXPENSE`)).json();
  expect(stored.find((item: { id: string }) => item.id === category.id)).toEqual(category);
  expect(await (await page.request.get(`${API}/transactions?categoryId=${category.id}`)).json()).toEqual(history);
  await page.goto('/movimientos/nuevo');
  await page.getByRole('button', { name: /Categoría/ }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Cafeterías', exact: true })).toBeVisible();
});

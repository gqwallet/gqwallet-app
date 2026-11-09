/**
 * Exercises country banks, incremental history, merchant grouping and catalog permissions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
import { PASSWORD, promoteToAdmin, signUp, uniqueEmail } from './helpers.ts';

interface Bank { id: string; name: string; countryCode: string; active: boolean }
interface ResourcePage<T> { content: T[] }
interface LedgerEntry { id: string }
interface Account { id: string }
interface Category { id: string }
interface ExpenseReport { topMerchants: { label: string; amount: number; share: number }[] }

const API = (process.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '') + '/api/v1';

test('country selection and other bank work in account and card create and edit forms', async ({ page }) => {
  await signUp(page, uniqueEmail('country'));
  await expect(page.getByLabel('País', { exact: true })).toHaveValue('PE');
  await page.getByLabel('País', { exact: true }).selectOption('CL');
  await page.getByLabel('Nombre', { exact: true }).fill('Ana');
  await page.getByLabel('Apellido', { exact: true }).fill('Torres');
  await page.getByLabel('Ingreso mensual de referencia', { exact: true }).fill('5000');
  await page.getByLabel('Colchón de vida', { exact: true }).fill('1000');
  await page.getByRole('button', { name: 'Guardar y continuar' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto('/perfil');
  await expect(page.getByLabel('País', { exact: true })).toHaveValue('CL');
  await page.getByLabel('País', { exact: true }).selectOption('PE');
  await page.getByRole('button', { name: 'Guardar datos' }).click();
  await expect(page.getByText('Tu perfil está actualizado.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('País', { exact: true })).toHaveValue('PE');
  await page.goto('/cuentas/nueva');
  await page.getByLabel('Alias', { exact: true }).fill('Cuenta local');
  await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'BCP' });
  await page.getByRole('button', { name: 'Guardar cuenta' }).click();
  await expect(page.getByText('Cuenta registrada')).toBeVisible();
  await page.getByRole('button', { name: /Cuenta local/ }).click();
  await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'Otro banco' });
  await page.getByLabel('Nombre del banco', { exact: true }).fill('Cooperativa del Sur');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText(/Cooperativa del Sur/).first()).toBeVisible();
  await page.goto('/tarjetas/nueva');
  await page.getByLabel('Nombre', { exact: true }).fill('Visa local');
  await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'Otro banco' });
  await page.getByLabel('Nombre del banco', { exact: true }).fill('Banco propio');
  await page.getByLabel('Línea de crédito', { exact: true }).fill('1000');
  await page.getByRole('button', { name: 'Guardar tarjeta' }).click();
  await expect(page.getByText('Tarjeta registrada')).toBeVisible();
  await page.getByRole('button', { name: 'Editar tarjeta', exact: true }).click();
  await expect(page.getByLabel('Nombre del banco', { exact: true })).toHaveValue('Banco propio');
  await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'Interbank' });
  await expect(page.getByLabel('Nombre del banco', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Cambios guardados')).toBeVisible();
  await page.goto('/cuentas/nueva');
  await page.getByRole('group', { name: 'Tipo de cuenta' }).getByRole('button', { name: 'Efectivo', exact: true }).click();
  await expect(page.getByLabel('Banco', { exact: true })).toHaveCount(0);
});

test('scroll loads page two without duplicates, account transfers and merchant variants', async ({ page }) => {
  await signUp(page, uniqueEmail('pagination'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  const banks = await (await page.request.get(`${API}/banks?country=PE`)).json() as Bank[];
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
  const accounts: Account[] = [];
  for (const alias of ['Cuenta pruebas', 'Destino pruebas']) {
    const response = await page.request.post(`${API}/accounts`, { data: { alias, bankId: banks[0].id, customBankName: null, type: 'DEBIT', currency: 'PEN', openingBalance: 1000, openingBalanceAsOf: today } });
    expect(response.status()).toBe(201); accounts.push(await response.json() as Account);
  }
  const categories = await (await page.request.get(`${API}/categories?nature=EXPENSE`)).json() as Category[];
  for (let index = 0; index < 25; index += 1) {
    const response = await page.request.post(`${API}/transactions`, { data: { nature: 'EXPENSE', amount: 1, currency: 'PEN', categoryId: categories[0].id, economicDate: today, paymentMethodKind: 'ACCOUNT', instrumentId: accounts[0].id, description: `Historial ${index}` } });
    expect(response.status()).toBe(201);
  }
  const firstResponse = page.waitForResponse((response) => response.url().includes('/ledger-entries?') && new URL(response.url()).searchParams.get('page') === '0');
  const secondResponse = page.waitForResponse((response) => response.url().includes('/ledger-entries?') && new URL(response.url()).searchParams.get('page') === '1');
  await page.goto('/movimientos');
  const first = await (await firstResponse).json() as ResourcePage<LedgerEntry>;
  expect(first.content).toHaveLength(20);
  await page.getByRole('button', { name: 'Ver más', exact: true }).scrollIntoViewIfNeeded();
  const second = await (await secondResponse).json() as ResourcePage<LedgerEntry>;
  expect(second.content).toHaveLength(5);
  expect(new Set([...first.content, ...second.content].map((entry) => entry.id)).size).toBe(25);
  await expect(page.getByText(/^Historial \d+ · Cuenta pruebas$/)).toHaveCount(25);
  for (const merchant of ['Tambo', 'tambo', 'TAMBO ']) {
    expect((await page.request.post(`${API}/transactions`, { data: { nature: 'EXPENSE', amount: 10, currency: 'PEN', categoryId: categories[0].id, economicDate: today, merchant } })).status()).toBe(201);
  }
  const report = await (await page.request.get(`${API}/expense-reports/me?year=${today.slice(0,4)}&currency=PEN`)).json() as ExpenseReport;
  expect(report.topMerchants.filter((merchant) => merchant.label.toLowerCase() === 'tambo')).toEqual([{ label: 'TAMBO', amount: 30, share: expect.any(Number) }]);
  expect(await (await page.request.get(`${API}/merchant-suggestions?prefix=tá`)).json()).toHaveLength(1);
  expect((await page.request.post(`${API}/transfers`, { data: { kind: 'ACCOUNT_TO_ACCOUNT', sourceAccountId: accounts[0].id, targetId: accounts[1].id, amount: 5, currency: 'PEN', economicDate: today, description: 'Transferencia de esta cuenta' } })).status()).toBe(201);
  await page.goto(`/cuentas/${accounts[1].id}`);
  await expect(page.getByText(/Transferencia de esta cuenta/)).toBeVisible();
});

test('bank writes require administrator, reject duplicates and allow deactivation only', async ({ page }) => {
  const email = uniqueEmail('banks-admin');
  await signUp(page, email);
  const bank = { name: `Banco E2E ${Date.now()}`, countryCode: 'PE' };
  const existing = (await (await page.request.get(`${API}/banks?country=PE`)).json() as Bank[])[0];
  expect((await page.request.post(`${API}/banks`, { data: bank })).status()).toBe(403);
  expect((await page.request.put(`${API}/banks/${existing.id}`, { data: { name: existing.name, countryCode: 'PE', active: true } })).status()).toBe(403);
  promoteToAdmin(email);
  await page.context().clearCookies();
  expect((await page.request.post(`${API}/authentication/sign-in`, { data: { email, password: PASSWORD } })).ok()).toBe(true);
  const createdResponse = await page.request.post(`${API}/banks`, { data: bank });
  expect(createdResponse.status()).toBe(201);
  const created = await createdResponse.json() as Bank;
  expect((await page.request.post(`${API}/banks`, { data: { ...bank, name: bank.name.toUpperCase() + ' ' } })).status()).toBe(409);
  expect((await page.request.put(`${API}/banks/${created.id}`, { data: { ...bank, active: false } })).status()).toBe(200);
  const active = await (await page.request.get(`${API}/banks?country=PE`)).json() as Bank[];
  expect(active.some((item) => item.id === created.id)).toBe(false);
  expect((await page.request.delete(`${API}/banks/${created.id}`)).status()).toBe(405);
});

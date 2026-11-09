/**
 * Shared steps of the end-to-end tests.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { execFileSync } from 'node:child_process';
import { expect, type Page } from '@playwright/test';

/** Password used by every test user. */
export const PASSWORD = 'clave12345';

/**
 * Returns a unique email for a test run.
 *
 * @param tag - Short label of the scenario.
 * @returns A fresh email.
 */
export function uniqueEmail(tag: string): string {
  return `e2e.${tag}.${Date.now()}.${Math.floor(Math.random() * 1e4)}@correo.pe`;
}

/**
 * Opens a page of the shell, using the drawer menu on small screens.
 *
 * @param page - Playwright page.
 * @param label - Sidebar link text.
 */
export async function goTo(page: Page, label: string): Promise<void> {
  const menu = page.getByRole('button', { name: 'Abrir menú' });
  if (await menu.isVisible()) {
    await menu.click();
    await page.getByRole('dialog', { name: 'Menú' }).getByRole('link', { name: label, exact: true }).click();
  } else {
    await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('link', { name: label, exact: true }).click();
  }
}

/**
 * Creates an account and waits for the initial setup form.
 *
 * @param page - Playwright page.
 * @param email - Email of the new user.
 */
export async function signUp(page: Page, email: string): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await page.getByLabel('Correo', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD);
  await page.getByRole('switch', { name: 'Acepto los términos y la política de privacidad' }).click();
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByText('Configura tu billetera')).toBeVisible();
}

/**
 * Promotes a user to administrator directly in the database (no admin provisioning exists in the API).
 *
 * @param email - Email of the user.
 */
export function promoteToAdmin(email: string): void {
  const sql = `insert into iam.user_roles (user_id, role) select id, 'ADMINISTRATOR' from iam.users where email = '${email}' on conflict do nothing;`;
  execFileSync('docker', ['exec', 'qs-gqwallet-api-postgres-1', 'psql', '-U', 'quedena', '-d', 'qs_gqwallet_db', '-c', sql]);
}

/**
 * Picks a category in the category dialog.
 *
 * @param page - Playwright page.
 * @param name - Category name.
 */
export async function chooseCategory(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: /Categoría/ }).click();
  await page.getByRole('dialog', { name: 'Elige una categoría' }).getByRole('button', { name, exact: true }).click();
}

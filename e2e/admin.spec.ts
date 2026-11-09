/**
 * End-to-end check of the administrator metrics panel (FR-013).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
import { PASSWORD, promoteToAdmin, signUp, uniqueEmail } from './helpers.ts';

test('an administrator sees registered and active users', async ({ page }) => {
  const email = uniqueEmail('admin');
  await signUp(page, email);
  promoteToAdmin(email);
  await page.context().clearCookies();
  await page.goto('/iniciar-sesion');
  await page.getByLabel('Correo', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/metricas/);
  await expect(page.getByText('Usuarios registrados')).toBeVisible();
  await expect(page.getByText(/Usuarios activos · 30 días/)).toBeVisible();
  await expect(page.getByText('Movimientos registrados por día')).toBeVisible();
});

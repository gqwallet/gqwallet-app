/**
 * Checks that every screen fits the viewport without horizontal page scroll.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
import { signUp, uniqueEmail } from './helpers.ts';

const ROUTES = [
  '/dashboard', '/dashboard/disponible', '/dashboard/vista-consolidada', '/dashboard/tipo-de-cambio', '/movimientos', '/movimientos/nuevo', '/transferencias/nueva',
  '/cuentas', '/cuentas/nueva', '/tarjetas', '/tarjetas/nueva', '/pagos-fijos', '/pagos-fijos/resumen', '/pagos-fijos/nuevo',
  '/presupuesto', '/flujo-de-caja', '/flujo-de-caja/carga-de-deuda', '/metas', '/metas/nueva', '/metas/fondo-de-emergencia',
  '/reportes', '/calendario', '/categorias', '/exportar', '/perfil',
];

test('no screen scrolls horizontally', async ({ page }) => {
  await signUp(page, uniqueEmail('layout'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(0);
  }
});

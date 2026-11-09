/**
 * End-to-end checks of the remaining requirements: profile, card edition, payment and deletion,
 * account balance, calendar and the referential consolidated view.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
import { chooseCategory, signUp, uniqueEmail } from './helpers.ts';

const API = (process.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '') + '/api/v1';

test('profile, cards, calendar and consolidated view', async ({ page }) => {
  await signUp(page, uniqueEmail('coverage'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();

  await test.step('updates the profile and rejects an invalid cushion (FR-003, FR-014)', async () => {
    await page.goto('/perfil');
    await page.getByLabel('Nombre', { exact: true }).fill('Ana María');
    await page.getByLabel('Apellido', { exact: true }).fill('Torres Pérez');
    await page.getByLabel('País', { exact: true }).selectOption('PE');
    await page.getByLabel('Fecha de nacimiento (opcional)', { exact: true }).fill('1995-03-14');
    await page.getByRole('button', { name: 'Guardar datos' }).click();
    await expect(page.getByText('Tu perfil está actualizado.')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('Ana María');
    await expect(page.getByLabel('Apellido', { exact: true })).toHaveValue('Torres Pérez');
    await expect(page.getByLabel('Fecha de nacimiento (opcional)', { exact: true })).toHaveValue('1995-03-14');
    await page.getByLabel('Ingreso mensual de referencia', { exact: true }).fill('8500');
    await page.getByLabel('Colchón de vida', { exact: true }).fill('9000');
    await page.getByRole('button', { name: 'Guardar parámetros' }).click();
    await expect(page.getByText('El colchón de vida no puede ser mayor a tu ingreso mensual.')).toBeVisible();
    await page.getByLabel('Colchón de vida', { exact: true }).fill('1500');
    await page.getByLabel('Umbral de carga de deuda', { exact: true }).fill('12.5');
    await page.getByRole('button', { name: 'Guardar parámetros' }).click();
    await expect(page.getByText('Tu perfil está actualizado.')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Umbral de carga de deuda', { exact: true })).toHaveValue('12.5');
    await expect(page.getByLabel('Fecha de nacimiento (opcional)', { exact: true })).toHaveValue('1995-03-14');
    await page.goto('/flujo-de-caja/carga-de-deuda');
    await page.getByRole('button', { name: 'Cambiar umbral' }).click();
    await expect(page.getByLabel('Umbral (%)', { exact: true })).toHaveValue('12.5');
    await page.getByLabel('Umbral (%)', { exact: true }).fill('15.25');
    await page.getByRole('button', { name: 'Guardar umbral' }).click();
    await expect(page.getByRole('dialog', { name: 'Cambiar umbral' })).not.toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Cambiar umbral' }).click();
    await expect(page.getByLabel('Umbral (%)', { exact: true })).toHaveValue('15.25');
    await page.goto('/perfil');
    await expect(page.getByLabel('Umbral de carga de deuda', { exact: true })).toHaveValue('15.25');
    await page.getByLabel('Fecha de nacimiento (opcional)', { exact: true }).fill('');
    await page.getByRole('button', { name: 'Guardar datos' }).click();
    await expect(page.getByText('Tu perfil está actualizado.')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Fecha de nacimiento (opcional)', { exact: true })).toHaveValue('');
  });

  await test.step('shows the calculated account balance (FR-020, FR-021)', async () => {
    await page.goto('/cuentas/nueva');
    await page.getByLabel('Alias', { exact: true }).fill('BCP Débito');
    await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'BCP' });
    await page.getByLabel('Saldo inicial', { exact: true }).fill('1000');
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await page.getByRole('button', { name: /BCP Débito/ }).click();
    await expect(page.getByText('Saldo calculado', { exact: true })).toBeVisible();
    await expect(page.getByText('S/ 1,000.00').first()).toBeVisible();
  });

  await test.step('registers a card, charges it, pays it and edits it (FR-004, FR-005, FR-017, FR-022, FR-023)', async () => {
    await page.goto('/tarjetas/nueva');
    await page.getByLabel('Nombre', { exact: true }).fill('Visa Interbank');
    await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'Interbank' });
    await page.getByLabel('Línea de crédito', { exact: true }).fill('10000');
    await page.getByLabel('Día de facturación', { exact: true }).selectOption('1');
    await page.getByLabel('Día de pago', { exact: true }).selectOption('28');
    await page.getByRole('button', { name: 'Guardar tarjeta' }).click();
    await expect(page.getByText('Tarjeta registrada')).toBeVisible();

    await page.goto('/movimientos/nuevo');
    await page.getByLabel('Importe', { exact: true }).fill('200');
    await chooseCategory(page, 'Supermercado');
    await page.getByLabel('Medio de pago', { exact: true }).selectOption({ label: 'Visa Interbank · PEN' });
    await page.getByRole('button', { name: 'Guardar gasto' }).click();
    await expect(page.getByText('Gasto registrado')).toBeVisible();

    await page.goto('/tarjetas');
    await expect(page.getByText('S/ 200.00 de S/ 10,000.00')).toBeVisible();
    await page.getByRole('button', { name: 'Ver detalle' }).click();
    await expect(page.getByText('Línea disponible').first()).toBeVisible();
    await expect(page.getByText('Fechas fijas').first()).toBeVisible();
    await page.getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Línea de crédito', { exact: true }).fill('12000');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Cambios guardados')).toBeVisible();
    await page.goto('/transferencias/nueva');
    await page.getByRole('group', { name: 'Tipo de transferencia' }).getByRole('button', { name: 'Pago de tarjeta' }).click();
    await page.getByLabel('Tarjeta a pagar', { exact: true }).selectOption({ label: 'Visa Interbank · PEN' });
    await page.getByLabel('Importe', { exact: true }).fill('200');
    await page.getByLabel('Descripción (opcional)', { exact: true }).fill('Pago del ciclo Visa');
    await page.getByRole('button', { name: 'Registrar pago', exact: true }).click();
    await expect(page.getByText('Pago de tarjeta registrado')).toBeVisible();
    await page.goto('/movimientos');
    await expect(page.getByText('BCP Débito → Visa Interbank · Pago del ciclo Visa')).toBeVisible();
  });

  await test.step('persists descriptions from both goal contribution forms', async () => {
    await page.goto('/metas/nueva');
    await page.getByLabel('Nombre', { exact: true }).fill('Vacaciones');
    await page.getByLabel('Importe objetivo', { exact: true }).fill('1000');
    await page.getByRole('button', { name: 'Crear meta' }).click();
    await expect(page.getByText('Meta creada')).toBeVisible();
    await page.goto('/transferencias/nueva');
    await page.getByRole('group', { name: 'Tipo de transferencia' }).getByRole('button', { name: 'Aporte a meta' }).click();
    await page.getByLabel('Meta de destino', { exact: true }).selectOption({ label: 'Vacaciones · PEN' });
    await page.getByLabel('Importe', { exact: true }).fill('50');
    await page.getByLabel('Descripción (opcional)', { exact: true }).fill('Aporte desde transferencia');
    await page.getByRole('button', { name: 'Registrar aporte' }).click();
    await expect(page.getByText('Aporte registrado')).toBeVisible();
    await page.getByRole('button', { name: 'Ver detalle' }).click();
    await expect(page.getByText(/Aporte desde transferencia/)).toBeVisible();
    await page.getByRole('button', { name: 'Aportar', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Aportar a Vacaciones' });
    await dialog.getByLabel('Importe', { exact: true }).fill('25');
    await dialog.getByLabel('Descripción (opcional)', { exact: true }).fill('Aporte desde meta');
    await dialog.getByRole('button', { name: 'Registrar aporte' }).click();
    await expect(dialog).not.toBeVisible();
    await page.reload();
    await expect(page.getByText(/Aporte desde meta/)).toBeVisible();
    await expect(page.getByText(/Aporte desde transferencia/)).toBeVisible();
  });

  await test.step('shows card dates in the calendar (FR-015, FR-016)', async () => {
    await page.goto('/calendario');
    await expect(page.getByText('Leyenda')).toBeVisible();
    await expect(page.getByText(/Visa Interbank · (facturación|pago)/).first()).toBeVisible();
    const sync = page.getByRole('button', { name: 'Sincronizar con Google Calendar' });
    // Google consent is unavailable when VITE_GOOGLE_CLIENT_ID is not configured.
    if (await sync.isDisabled()) {
      await expect(page.getByText('Disponible pronto', { exact: true })).toBeVisible();
      await expect(page.getByRole('switch')).toBeDisabled();
    } else {
      await sync.click({ timeout: 10_000 });
      await expect(page.getByRole('dialog', { name: 'Sincronizar con Google Calendar' })).toBeVisible();
      await page.getByRole('button', { name: 'No autorizar' }).click();
    }
  });

  await test.step('registers a rate and shows the referential view (FR-047)', async () => {
    await page.goto('/dashboard/vista-consolidada');
    await expect(page.getByText('Registra un tipo de cambio')).toBeVisible();
    await expect(page.getByText('Para mostrar una vista consolidada necesitamos un tipo de cambio y su fecha. Mientras tanto, no sumamos tus monedas.')).toBeVisible();
    await expect(page.getByText(/Total referencial/)).not.toBeVisible();
    await page.getByRole('button', { name: 'Volver al dashboard' }).click();
    for (const label of ['PEN · Soles', 'USD · Dólares']) {
      await page.getByRole('group', { name: 'Moneda' }).getByRole('button', { name: label }).click();
      await expect(page.getByRole('button', { name: /Posición neta.*Ver desglose/ })).toBeVisible();
    }
    await page.goto('/dashboard/vista-consolidada');
    await page.getByRole('button', { name: 'Registrar tipo de cambio' }).click();
    await expect(page).toHaveURL(/dashboard\/tipo-de-cambio$/);
    await page.getByLabel('Soles por 1 dólar', { exact: true }).fill('3.75');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Valores referenciales')).toBeVisible();
    await expect(page.getByText(/Total referencial en soles/)).toBeVisible();
  });

  await test.step('deletes a card keeping its movements (FR-006)', async () => {
    await page.goto('/tarjetas');
    await page.getByRole('button', { name: 'Ver detalle' }).click();
    await page.getByRole('button', { name: 'Editar' }).click();
    await page.getByRole('button', { name: 'Eliminar tarjeta' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Eliminar tarjeta' }).click();
    await expect(page.getByText('Tarjeta eliminada')).toBeVisible();
  });

  await test.step('assigns closing-day purchases according to the optional card cut-off', async () => {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
    const billingDay = Number(today.slice(8, 10));
    await page.goto('/tarjetas/nueva');
    await page.getByLabel('Nombre', { exact: true }).fill('Visa con corte');
    await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'Interbank' });
    await page.getByLabel('Línea de crédito', { exact: true }).fill('10000');
    await page.getByLabel('Día de facturación', { exact: true }).selectOption(String(billingDay));
    await page.getByLabel('Día de pago', { exact: true }).selectOption(billingDay === 28 ? '5' : '28');
    const cutoff = page.getByRole('group', { name: 'Hora de corte' });
    await cutoff.getByLabel('Hora de corte', { exact: true }).selectOption('22');
    await cutoff.getByLabel('Minutos', { exact: true }).selectOption('00');
    const creation = page.waitForResponse((response) => response.url().endsWith('/api/v1/cards') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Guardar tarjeta' }).click();
    const card: { id: string; billingCutoffTime: string | null } = await (await creation).json();
    expect(card.billingCutoffTime).toBe('22:00');
    await expect(page.getByText('Tarjeta registrada')).toBeVisible();
    await expect(page.getByText(`PEN · Facturación día ${billingDay} · corte 22:00 · Pago día ${billingDay === 28 ? 5 : 28}`)).toBeVisible();

    const cyclesResponse = await page.request.get(`${API}/cards/${card.id}/billing-cycles`);
    expect(cyclesResponse.ok()).toBe(true);
    const cycles: { closingDate: string }[] = await cyclesResponse.json();
    const nextClosingDate = cycles.map((cycle) => cycle.closingDate).sort().find((date) => date > today);
    expect(nextClosingDate).toBeDefined();

    for (const purchase of [
      { hour: '22', minute: '30', amount: '30', merchant: 'Después del corte', closingDate: nextClosingDate, total: 'S/ 0.00' },
      { hour: '21', minute: '00', amount: '20', merchant: 'Antes del corte', closingDate: today, total: 'S/ 20.00' },
    ]) {
      await page.goto('/movimientos/nuevo');
      await page.getByLabel('Importe', { exact: true }).fill(purchase.amount);
      await chooseCategory(page, 'Supermercado');
      await page.getByLabel('Fecha económica', { exact: true }).fill(today);
      await page.getByLabel('Medio de pago', { exact: true }).selectOption({ label: 'Visa con corte · PEN' });
      const time = page.getByRole('group', { name: 'Hora del consumo' });
      await time.getByLabel('Hora del consumo', { exact: true }).selectOption(purchase.hour);
      await time.getByLabel('Minutos', { exact: true }).selectOption(purchase.minute);
      await page.getByLabel('Comercio', { exact: true }).fill(purchase.merchant);
      const registration = page.waitForResponse((response) => response.url().endsWith('/api/v1/transactions') && response.request().method() === 'POST');
      await page.getByRole('button', { name: 'Guardar gasto' }).click();
      const response = await registration;
      expect(response.ok()).toBe(true);
      expect(response.request().postDataJSON()).not.toHaveProperty('purchaseTime');
      const transaction: { cycleClosingDate: string } = await response.json();
      expect(transaction.cycleClosingDate).toBe(purchase.closingDate);
      await expect(page.getByText('Gasto registrado')).toBeVisible();

      const projection = page.waitForResponse((result) => result.url().endsWith(`/cards/${card.id}/next-billing`) && result.ok());
      await page.goto(`/tarjetas/${card.id}`);
      const nextBilling: { billingDate: string } = await (await projection).json();
      expect(nextBilling.billingDate).toBe(today);
      await expect(page.getByText('Total a pagar', { exact: true }).first().locator('..')).toContainText(purchase.total);
      await expect(page.getByText('Corte', { exact: true }).locator('..')).toContainText('22:00');
      await expect(page.getByText(/Después del corte ·/)).not.toBeVisible();
    }
    await expect(page.getByText(/Antes del corte ·/)).toBeVisible();
  });
});

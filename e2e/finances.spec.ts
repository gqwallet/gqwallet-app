/**
 * End-to-end journey of a new user over the real backend: sign-up, setup, accounts, cards,
 * movements, budget with zero limit, fixed payments, goals, transfers, reports, exports and sign-out.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, test } from '@playwright/test';
import { chooseCategory, goTo, PASSWORD, signUp, uniqueEmail } from './helpers.ts';

test.describe.configure({ mode: 'serial' });

test('a new user manages her finances end to end', async ({ page }) => {
  const email = uniqueEmail('journey');

  await test.step('sign-up requires consent (FR-001, NFR-009)', async () => {
    await page.goto('/crear-cuenta');
    await page.getByLabel('Correo', { exact: true }).fill(email);
    await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText('Debes aceptar los términos y la política de privacidad para crear tu cuenta.')).toBeVisible();
    await page.getByRole('switch', { name: 'Acepto los términos y la política de privacidad' }).click();
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page.getByText('Configura tu billetera')).toBeVisible();
  });

  await test.step('initial setup requires names and rejects a cushion above the income (FR-014)', async () => {
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();
    await expect(page.getByText('Ingresa tu nombre (máximo 150 caracteres).')).toBeVisible();
    await page.getByLabel('Nombre', { exact: true }).fill('Ana María');
    await page.getByLabel('Apellido', { exact: true }).fill('Torres Pérez');
    await page.getByLabel('País', { exact: true }).selectOption('PE');
    await page.getByLabel('Ingreso mensual de referencia', { exact: true }).fill('8500');
    await page.getByLabel('Colchón de vida', { exact: true }).fill('9000');
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();
    await expect(page.getByText('El colchón de vida no puede ser mayor a tu ingreso mensual. No guardamos los cambios.')).toBeVisible();
    await page.getByLabel('Colchón de vida', { exact: true }).fill('1500');
    await page.getByRole('button', { name: 'Guardar y continuar' }).click();
    await expect(page.getByText('Aún no tienes registros')).toBeVisible();
  });

  await test.step('registers two accounts and rejects a repeated alias (FR-020)', async () => {
    for (const alias of ['BCP Débito', 'Interbank Ahorro']) {
      await page.goto('/cuentas/nueva');
      await page.getByLabel('Alias', { exact: true }).fill(alias);
      await page.getByLabel('Banco', { exact: true }).selectOption({ label: alias.startsWith('Interbank') ? 'Interbank' : 'BCP' });
      await page.getByLabel('Saldo inicial', { exact: true }).fill('1000');
      await page.getByRole('button', { name: 'Guardar cuenta' }).click();
      await expect(page.getByText('Cuenta registrada')).toBeVisible();
    }
    await page.goto('/cuentas/nueva');
    await page.getByLabel('Alias', { exact: true }).fill('BCP Débito');
    await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'BCP' });
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await expect(page.getByText('Ya tienes una cuenta con este alias. Usa otro nombre.')).toBeVisible();
  });

  await test.step('registers a card and rejects the same billing and payment day (FR-004)', async () => {
    await page.goto('/tarjetas/nueva');
    await page.getByLabel('Nombre', { exact: true }).fill('Visa Interbank');
    await page.getByLabel('Banco', { exact: true }).selectOption({ label: 'Interbank' });
    await page.getByLabel('Línea de crédito', { exact: true }).fill('10000');
    await page.getByLabel('Día de facturación', { exact: true }).selectOption('12');
    await page.getByLabel('Día de pago', { exact: true }).selectOption('12');
    await page.getByRole('button', { name: 'Guardar tarjeta' }).click();
    await expect(page.getByText('El día de pago no puede ser el mismo día de facturación.')).toBeVisible();
    await page.getByLabel('Día de pago', { exact: true }).selectOption('28');
    await page.getByRole('button', { name: 'Guardar tarjeta' }).click();
    await expect(page.getByText('Tarjeta registrada')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Visa Interbank' })).toBeVisible();
  });

  await test.step('registers an expense with merchant and an income (FR-007, FR-008, FR-024, FR-025)', async () => {
    await page.goto('/movimientos/nuevo');
    await page.getByRole('button', { name: 'Guardar gasto' }).click();
    await expect(page.getByText('Revisa los campos marcados')).toBeVisible();
    await page.getByLabel('Importe', { exact: true }).fill('45.90');
    await chooseCategory(page, 'Comida y restaurantes');
    await page.getByLabel('Comercio', { exact: true }).fill('Tambo');
    await page.getByRole('group', { name: '¿Es un gasto esencial?' }).getByRole('button', { name: 'Sí' }).click();
    await page.getByRole('button', { name: 'Guardar gasto' }).click();
    await expect(page.getByText('Gasto registrado')).toBeVisible();
    await expect(page.getByText('Tambo · BCP Débito')).toBeVisible();

    await page.goto('/movimientos/nuevo?tipo=ingreso');
    await page.getByLabel('Importe', { exact: true }).fill('7500');
    await chooseCategory(page, 'Sueldo');
    await page.getByRole('group', { name: 'Fuente' }).getByRole('button', { name: 'Empresa' }).click();
    await page.getByRole('button', { name: 'Guardar ingreso' }).click();
    await expect(page.getByText('Ingreso registrado')).toBeVisible();
    await expect(page.getByText('+S/ 7,500.00')).toBeVisible();
  });

  await test.step('suggests a merchant already used (FR-024)', async () => {
    await page.goto('/movimientos/nuevo');
    await page.getByLabel('Comercio', { exact: true }).fill('Ta');
    await expect(page.getByText('Sugerencia: Tambo (ya lo usaste antes).')).toBeVisible();
  });

  await test.step('warns before spending in a zero-limit category and marks it exceeded (FR-033, FR-034)', async () => {
    await page.goto('/presupuesto');
    await page.getByRole('button', { name: 'Definir límite' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Definir límite' });
    await dialog.getByLabel('Categoría', { exact: true }).selectOption({ label: 'Bares y discotecas' });
    await dialog.getByLabel('Límite', { exact: true }).fill('0');
    await dialog.getByRole('button', { name: 'Guardar límite' }).click();
    await expect(page.getByText('Límite guardado')).toBeVisible();
    await expect(page.getByRole('row', { name: /Bares y discotecas/ })).toContainText('Sin gasto');

    await page.goto('/movimientos/nuevo');
    await page.getByLabel('Importe', { exact: true }).fill('30');
    await chooseCategory(page, 'Bares y discotecas');
    await page.getByRole('button', { name: 'Guardar gasto' }).click();
    await expect(page.getByRole('dialog', { name: '¿Registrar igual este gasto?' })).toBeVisible();
    await page.getByRole('button', { name: 'Registrar igual' }).click();
    await expect(page.getByText('Gasto registrado')).toBeVisible();

    await page.goto('/presupuesto');
    await expect(page.getByRole('row', { name: /Bares y discotecas/ })).toContainText('Excedido');
    await expect(page.getByRole('row', { name: /Comida y restaurantes/ })).toContainText('Sin presupuesto');
  });

  await test.step('creates a fixed payment and pays its due in one step (FR-029 to FR-032)', async () => {
    await page.goto('/pagos-fijos/nuevo');
    await page.getByLabel('Descripción', { exact: true }).fill('Internet');
    await page.getByLabel('Categoría de gasto para el presupuesto', { exact: true }).selectOption({ label: 'Servicios' });
    await page.getByLabel('Monto mensual', { exact: true }).fill('99');
    await page.getByLabel('Día de vencimiento', { exact: true }).fill('28');
    await page.getByLabel('Medio de pago habitual', { exact: true }).selectOption({ label: 'BCP Débito · PEN' });
    await page.getByRole('button', { name: 'Guardar pago fijo' }).click();
    await expect(page.getByText('Pago fijo registrado')).toBeVisible();
    await page.getByRole('button', { name: /Internet/ }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Confirmar pago de Internet' });
    await expect(dialog.getByText('BCP Débito · habitual')).toBeVisible();
    await dialog.getByRole('button', { name: 'Confirmar pago' }).click();
    await expect(page.getByText('Pago registrado')).toBeVisible();

    await page.goto('/pagos-fijos/resumen');
    await expect(page.getByText('S/ 1,188.00')).toBeVisible();
  });

  await test.step('pays the card and transfers between accounts without touching totals (FR-023, FR-028)', async () => {
    await page.goto('/transferencias/nueva');
    await page.getByLabel('Cuenta de destino', { exact: true }).selectOption({ label: 'Interbank Ahorro · PEN' });
    await page.getByLabel('Importe', { exact: true }).fill('300');
    await expect(page.getByLabel('Descripción (opcional)', { exact: true })).toHaveAttribute('maxlength', '120');
    await page.getByLabel('Descripción (opcional)', { exact: true }).fill('Reserva mensual entre cuentas');
    await page.getByRole('button', { name: 'Registrar transferencia' }).click();
    await expect(page.getByText('Transferencia registrada')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cuentas' }).or(page.getByText('Saldo calculado al')).first()).toBeVisible();
    await page.goto('/movimientos');
    await expect(page.getByText('BCP Débito → Interbank Ahorro · Reserva mensual entre cuentas')).toBeVisible();
    await page.goto('/cuentas');
    await page.getByRole('button', { name: /Interbank Ahorro/ }).click();
    await expect(page.getByText('Reserva mensual entre cuentas', { exact: false })).toBeVisible();
  });

  await test.step('creates goals and rejects a second emergency fund (FR-038, FR-039)', async () => {
    for (const name of ['Fondo de emergencia', 'Fondo de reserva']) {
      await page.goto('/metas/nueva');
      await page.getByLabel('Nombre', { exact: true }).fill(name);
      await page.getByLabel('Importe objetivo', { exact: true }).fill('5000');
      await page.getByRole('switch', { name: 'Usar como fondo de emergencia' }).click();
      await page.getByRole('button', { name: 'Crear meta' }).click();
    }
    await expect(page.getByText('Ya tienes un fondo de emergencia en soles')).toBeVisible();
    await page.goto('/metas');
    await page.getByRole('button', { name: 'Ver fondo' }).click();
    await expect(page.getByText('Mínimo recomendado · 3 meses').first()).toBeVisible();
  });

  await test.step('shows the dashboard, cash flow, debt load and reports (FR-009, FR-035, FR-036, FR-037, FR-040)', async () => {
    await goTo(page, 'Dashboard');
    await expect(page.getByText('Próximos vencimientos')).toBeVisible();
    await expect(page.getByText('Uso del presupuesto de')).toBeVisible();
    await page.getByRole('button', { name: /Disponible al/ }).click();
    await expect(page.getByText('Disponible calculado')).toBeVisible();
    await goTo(page, 'Flujo de caja');
    await expect(page.getByRole('table', { name: /Flujo de caja/ })).toContainText('7,500.00');
    await page.getByRole('button', { name: 'Carga de deuda' }).click();
    await expect(page.getByText(/Serie de 12 meses/)).toBeVisible();
    await goTo(page, 'Reportes');
    await expect(page.getByText('Gasto total', { exact: true })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Top 10 comercios' })).toContainText('Tambo');
  });

  await test.step('exports movements and transfers using the server CSV filename (FR-041)', async () => {
    const csvResponse = page.waitForResponse((response) => response.url().includes('/api/v1/transactions?') && response.request().headers()['accept'] === 'text/csv');
    await goTo(page, 'Exportar');
    const response = await csvResponse;
    const disposition = response.headers()['content-disposition'];
    expect(disposition).toBeTruthy();
    const extended = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    const plain = /filename="?([^";]+)/i.exec(disposition);
    const serverName = extended ? decodeURIComponent(extended[1]) : plain?.[1];
    expect(serverName).toBeTruthy();
    expect(await response.text()).toContain('Reserva mensual entre cuentas');
    await expect(page.getByText(/movimientos, sin filas de totales/)).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar CSV' }).click();
    expect((await download).suggestedFilename()).toBe(serverName);
  });

  await test.step('voids a movement with a reason and keeps it in the history (FR-026, FR-027)', async () => {
    await goTo(page, 'Movimientos');
    await page.getByRole('button', { name: /Comida y restaurantes/ }).first().click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'movement detail fits the viewport').toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: 'Anular' }).click();
    await page.getByRole('dialog').getByLabel('Motivo', { exact: true }).fill('Lo registré dos veces');
    await page.getByRole('button', { name: 'Anular gasto' }).click();
    await expect(page.getByText('Gasto anulado')).toBeVisible();
    await expect(page.getByText('Anulado').first()).toBeVisible();
  });

  await test.step('creates a category and rejects a repeated name (FR-019)', async () => {
    await goTo(page, 'Categorías');
    await page.getByRole('button', { name: 'Nueva categoría' }).click();
    await page.getByRole('dialog').getByLabel('Nombre', { exact: true }).fill('Viajes');
    await page.getByRole('button', { name: 'Crear categoría' }).click();
    await expect(page.getByText('Categoría creada')).toBeVisible();
    await page.getByRole('button', { name: 'Nueva categoría' }).click();
    await page.getByRole('dialog').getByLabel('Nombre', { exact: true }).fill('Viajes');
    await page.getByRole('button', { name: 'Crear categoría' }).click();
    await expect(page.getByText('Ya tienes una categoría de gasto con ese nombre.')).toBeVisible();
  });

  await test.step('signs out and rejects wrong credentials (FR-002)', async () => {
    await page.keyboard.press('Escape');
    const menu = page.getByRole('button', { name: 'Abrir menú' });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole('button', { name: 'Cerrar sesión' }).last().click();
    await page.goto('/iniciar-sesion');
    await page.getByLabel('Correo', { exact: true }).fill(email);
    await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta1');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText('No pudimos iniciar sesión')).toBeVisible();
    await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });
});

test('a registered user cannot open the admin metrics (FR-013)', async ({ page }) => {
  await signUp(page, uniqueEmail('user'));
  await page.getByRole('button', { name: 'Omitir por ahora' }).click();
  await page.goto('/metricas');
  await expect(page.getByText('No tienes acceso a esta sección')).toBeVisible();
});

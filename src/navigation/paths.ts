/**
 * Route paths of the app, shared by the router, the sidebar and the pages.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Every route path; dynamic segments use `:id`. */
export const PATHS = {
  welcome: '/',
  signUp: '/crear-cuenta',
  signIn: '/iniciar-sesion',
  onboarding: '/configuracion-inicial',
  dashboard: '/dashboard',
  transactions: '/movimientos',
  newTransaction: '/movimientos/nuevo',
  transaction: '/movimientos/:id',
  newTransfer: '/transferencias/nueva',
  accounts: '/cuentas',
  newAccount: '/cuentas/nueva',
  account: '/cuentas/:id',
  cards: '/tarjetas',
  newCard: '/tarjetas/nueva',
  editCard: '/tarjetas/:id/editar',
  card: '/tarjetas/:id',
  fixedPayments: '/pagos-fijos',
  fixedPaymentsSummary: '/pagos-fijos/resumen',
  newFixedPayment: '/pagos-fijos/nuevo',
  editFixedPayment: '/pagos-fijos/:id/editar',
  budget: '/presupuesto',
  cashFlow: '/flujo-de-caja',
  debtLoad: '/flujo-de-caja/carga-de-deuda',
  goals: '/metas',
  newGoal: '/metas/nueva',
  goal: '/metas/:id',
  emergencyFund: '/metas/fondo-de-emergencia',
  reports: '/reportes',
  calendar: '/calendario',
  calendarCallback: '/calendario/conexion',
  categories: '/categorias',
  exports: '/exportar',
  profile: '/perfil',
  availableBalance: '/dashboard/disponible',
  consolidated: '/dashboard/vista-consolidada',
  exchangeRate: '/dashboard/tipo-de-cambio',
  metrics: '/metricas',
} as const;

/**
 * Builds a path by replacing its `:id` segment.
 *
 * @param path - Path with an `:id` segment.
 * @param id - Identifier to insert.
 * @returns The concrete path.
 * @example
 * ```ts
 * withId(PATHS.card, 'c1'); // '/tarjetas/c1'
 * ```
 */
export function withId(path: string, id: string): string {
  return path.replace(':id', encodeURIComponent(id));
}

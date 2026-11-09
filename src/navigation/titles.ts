/**
 * Titles shown in the mobile header for each route.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { PATHS } from '@/navigation/paths';

const TITLES: Array<[string, string]> = [
  [PATHS.newTransaction, 'Nuevo movimiento'],
  [PATHS.newTransfer, 'Nueva transferencia'],
  [PATHS.newAccount, 'Nueva cuenta'],
  [PATHS.newCard, 'Nueva tarjeta'],
  [PATHS.newGoal, 'Nueva meta'],
  [PATHS.newFixedPayment, 'Nuevo pago fijo'],
  [PATHS.availableBalance, 'Disponible a la fecha'],
  [PATHS.consolidated, 'Vista consolidada'],
  [PATHS.exchangeRate, 'Tipo de cambio'],
  [PATHS.dashboard, 'Dashboard'],
  [PATHS.transactions, 'Movimientos'],
  [PATHS.accounts, 'Cuentas'],
  [PATHS.cards, 'Tarjetas'],
  [PATHS.fixedPaymentsSummary, 'Resumen de pagos fijos'],
  [PATHS.fixedPayments, 'Pagos fijos'],
  [PATHS.budget, 'Presupuesto'],
  [PATHS.debtLoad, 'Carga de deuda'],
  [PATHS.cashFlow, 'Flujo de caja'],
  [PATHS.emergencyFund, 'Fondo de emergencia'],
  [PATHS.goals, 'Metas'],
  [PATHS.reports, 'Reportes'],
  [PATHS.calendar, 'Calendario'],
  [PATHS.categories, 'Categorías'],
  [PATHS.exports, 'Exportar'],
  [PATHS.profile, 'Perfil'],
  [PATHS.metrics, 'Métricas'],
];

/**
 * Returns the mobile header title of a path, matching the longest known prefix.
 *
 * @param pathname - Current path.
 * @returns Title text.
 * @example
 * ```ts
 * titleFor('/tarjetas/abc'); // 'Tarjetas'
 * ```
 */
export function titleFor(pathname: string): string {
  const match = TITLES.find(([path]) => pathname === path || pathname.startsWith(`${path}/`));
  return match ? match[1] : 'GQWallet';
}

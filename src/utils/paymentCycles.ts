/**
 * Presentation labels for server-calculated payment cycle states.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { PaymentCycleStatus } from '@/types/card';

/** Returns the localized label of a payment cycle state. */
export function paymentCycleLabel(status: PaymentCycleStatus): string {
  return { PENDING: 'Pendiente', PARTIAL: 'Parcial', OVERDUE: 'Vencida', PAID: 'Pagada', OPEN: 'En curso' }[status];
}

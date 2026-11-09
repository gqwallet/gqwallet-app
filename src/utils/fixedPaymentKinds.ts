/**
 * Fixed-payment rules shared by forms and due descriptions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { FixedPaymentKind } from '@/types/obligation';

/**
 * Returns whether a fixed-payment kind supports installment counts.
 *
 * @param kind - Fixed-payment category.
 * @returns Whether installments are allowed.
 */
export function allowsInstallments(kind: FixedPaymentKind): boolean {
  return kind === 'DEBT' || kind === 'INSTALLMENT_PURCHASE';
}

/**
 * Returns whether the scheduled day describes a recurring charge.
 *
 * @param kind - Fixed-payment category.
 * @returns Whether to describe the date as a charge.
 */
export function chargesOnDay(kind: FixedPaymentKind): boolean {
  return kind === 'SUBSCRIPTIONS' || kind === 'MEMBERSHIPS' || kind === 'HOUSEHOLD_SERVICES';
}

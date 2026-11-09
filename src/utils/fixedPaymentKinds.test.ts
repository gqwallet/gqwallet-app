/**
 * Tests fixed-payment installment and charge rules for every category.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import type { FixedPaymentKind } from '@/types/obligation';
import { allowsInstallments, chargesOnDay } from '@/utils/fixedPaymentKinds';

const cases: [FixedPaymentKind, boolean, boolean][] = [
  ['HOUSEHOLD_SERVICES', false, true],
  ['SUBSCRIPTIONS', false, true],
  ['MEMBERSHIPS', false, true],
  ['DEBT', true, false],
  ['RENT', false, false],
  ['INSTALLMENT_PURCHASE', true, false],
];

describe('fixedPaymentKinds', () => {
  it.each(cases)('applies installment and charge rules for %s', (kind, installments, charge) => {
    expect(allowsInstallments(kind)).toBe(installments);
    expect(chargesOnDay(kind)).toBe(charge);
  });
});

/**
 * Tests date-only opening debt candidates and month-end clamping.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, it } from 'vitest';
import { openingDebtCycles } from '@/utils/openingDebtCycles';

it('offers recent closed dates and the current cycle using the selected billing day', () => {
  expect(openingDebtCycles(10, 5, '2026-11-09')).toEqual([
    { closingDate: '2026-08-10', paymentDueDate: '2026-09-05' },
    { closingDate: '2026-09-10', paymentDueDate: '2026-10-05' },
    { closingDate: '2026-10-10', paymentDueDate: '2026-11-05' },
    { closingDate: '2026-11-10', paymentDueDate: '2026-12-05' },
  ]);
});

it('keeps the configured day across shorter months and year boundaries', () => {
  expect(openingDebtCycles(31, 5, '2027-03-01')).toContainEqual({ closingDate: '2027-02-28', paymentDueDate: '2027-03-05' });
  expect(openingDebtCycles(31, 5, '2027-01-01')[0]).toEqual({ closingDate: '2026-10-31', paymentDueDate: '2026-11-05' });
});

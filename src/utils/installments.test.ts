/**
 * Tests the last month of installment schedules with previously paid installments.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import { installmentEndMonth } from '@/utils/installments';

describe('installmentEndMonth', () => {
  it.each([
    ['2026-10', 24, 13, '2027-08'],
    ['2026-11', 24, 0, '2028-10'],
    ['2026-12', 2, 0, '2027-01'],
    ['2028-02', 12, 11, '2028-02'],
    ['2026-10', 1, 0, '2026-10'],
  ])('ends a schedule starting in %s with %i total and %i paid in %s', (start, total, paid, end) => {
    expect(installmentEndMonth(start, total, paid)).toBe(end);
  });

  it.each([
    [null, 0], [0, 0], [-1, 0], [2.5, 0], [Number.NaN, 0], [Infinity, 0],
    [24, -1], [24, 1.5], [24, 24], [24, 25], [24, Number.NaN], [24, Infinity],
  ])('returns no end month for invalid counts (%s total, %s paid)', (total, paid) => {
    expect(installmentEndMonth('2026-10', total, paid)).toBeNull();
  });
});

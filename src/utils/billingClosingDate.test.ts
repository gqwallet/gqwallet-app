/**
 * Effective closing dates across different month lengths.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, it } from 'vitest';
import { isBillingClosingDate } from '@/utils/billingClosingDate';

it.each([
  ['2026-11-30', '2026-10-31', true],
  ['2027-02-28', '2026-10-31', true],
  ['2028-02-29', '2026-10-31', true],
  ['2028-02-28', '2026-10-31', false],
  ['2027-02-28', '2026-10-29', true],
  ['2026-11-30', '2026-10-30', true],
  ['2026-10-31', '2026-10-31', true],
  ['2026-11-29', '2026-10-31', false],
  ['2026-11-10', '2026-10-10', true],
])('recognizes %s for configured date %s as %s', (date, configured, expected) => {
  expect(isBillingClosingDate(date, configured)).toBe(expected);
});

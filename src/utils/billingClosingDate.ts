/**
 * Monthly card closing-day recognition, including short months and leap years.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Checks whether a date is the effective monthly close of a card.
 * @param date - Economic date in ISO format.
 * @param billingDate - Configured billing date, whose day repeats monthly.
 * @returns Whether the date matches the configured day clamped to month end.
 * @example
 * ```ts
 * isBillingClosingDate('2026-11-30', '2026-10-31'); // true
 * ```
 */
export function isBillingClosingDate(date: string, billingDate: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return day === Math.min(Number(billingDate.slice(8, 10)), lastDay);
}

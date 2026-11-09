/**
 * Earliest date the app accepts in its date, month and year pickers.
 *
 * The product started in November 2026, so no record can be older than one month before it.
 * There is no upper limit.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Earliest ISO date for day pickers. */
export const MIN_DATE = '2026-10-01';

/** Earliest month key `YYYY-MM` for month pickers. */
export const MIN_MONTH = MIN_DATE.slice(0, 7);

/** Earliest year for year pickers. */
export const MIN_YEAR = Number(MIN_DATE.slice(0, 4));

/**
 * Raises a month key to {@link MIN_MONTH} when it is older.
 *
 * @param period - Month key `YYYY-MM`.
 * @returns The same key, or {@link MIN_MONTH} if it was earlier.
 * @example
 * ```ts
 * clampMonth('2026-08'); // '2026-10'
 * ```
 */
export function clampMonth(period: string): string {
  return period < MIN_MONTH ? MIN_MONTH : period;
}

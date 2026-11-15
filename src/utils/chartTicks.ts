/**
 * Readable chart scales without changing the underlying financial values.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Covers the data and zero with ticks spaced by 1, 2, 2.5 or 5 times a power of ten,
 * keeping at least one cent between financial labels.
 * @param values - Values plotted on one axis.
 * @returns Ascending ticks, including zero and at least one nonzero tick.
 * @example
 * ```ts
 * niceTicks([931.74]); // [0, 250, 500, 750, 1000]
 * ```
 */
export function niceTicks(values: number[]): number[] {
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values) || (low === 0 ? 1 : 0);
  const target = Math.max((high - low || 1) / 4, 0.01);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const multiple = [1, 2, 2.5, 5, 10].find(value => value >= target / magnitude)!;
  const step = multiple * magnitude;
  const start = Math.floor(low / step);
  const end = Math.max(start + 1, Math.ceil(high / step));
  return Array.from({ length: end - start + 1 }, (_, index) => Number(((start + index) * step).toPrecision(12)));
}

/**
 * Regression tests for readable positive, negative and empty chart scales.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { expect, it } from 'vitest';
import { niceTicks } from '@/utils/chartTicks';

it.each([
  [[931.74], [0, 250, 500, 750, 1000]],
  [[698.81], [0, 200, 400, 600, 800]],
  [[5800], [0, 2000, 4000, 6000]],
  [[3.89], [0, 1, 2, 3, 4]],
  [[17.5], [0, 5, 10, 15, 20]],
  [[-931.74], [-1000, -750, -500, -250, 0]],
  [[-251, 698.81], [-500, -250, 0, 250, 500, 750]],
  [[0.07], [0, 0.02, 0.04, 0.06, 0.08]],
  [[0.01], [0, 0.01]],
  [[0], [0, 0.25, 0.5, 0.75, 1]],
  [[], [0, 0.25, 0.5, 0.75, 1]],
])('covers %j with nice ticks %j', (values, expected) => {
  expect(niceTicks(values)).toEqual(expected);
});

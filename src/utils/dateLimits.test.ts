/**
 * Tests the earliest date accepted by the pickers.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import { clampMonth, MIN_DATE, MIN_MONTH, MIN_YEAR } from '@/utils/dateLimits';

describe('dateLimits', () => {
  it('starts at October 2026', () => {
    expect(MIN_DATE).toBe('2026-10-01');
    expect(MIN_MONTH).toBe('2026-10');
    expect(MIN_YEAR).toBe(2026);
  });

  it('raises earlier months and keeps later ones', () => {
    expect(clampMonth('2026-08')).toBe('2026-10');
    expect(clampMonth('2026-10')).toBe('2026-10');
    expect(clampMonth('2031-03')).toBe('2031-03');
  });
});

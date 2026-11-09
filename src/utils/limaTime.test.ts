/**
 * Tests Lima calendar boundaries and five-minute rounding.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import { limaPurchaseTime } from '@/utils/limaTime';

describe('limaPurchaseTime', () => {
  it('uses the Lima date across UTC midnight and rounds down', () => {
    const now = new Date('2026-11-09T03:08:59Z');
    expect(limaPurchaseTime('2026-11-08', now)).toBe('22:05');
    expect(limaPurchaseTime('2026-11-09', now)).toBe('');
    expect(limaPurchaseTime('2026-11-07', now)).toBe('');
  });
  it('returns midnight as 00 and keeps exact five-minute boundaries', () => {
    expect(limaPurchaseTime('2026-11-08', new Date('2026-11-08T05:00:00Z'))).toBe('00:00');
    expect(limaPurchaseTime('2026-11-08', new Date('2026-11-09T04:55:00Z'))).toBe('23:55');
  });
});

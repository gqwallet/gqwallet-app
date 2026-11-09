/**
 * Tests of the formatters.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { describe, expect, it } from 'vitest';
import {
  formatMoney, formatMonth, formatPercent, formatShortDate, formatSignedMoney, formatWeekdayDate, initials, monthRange, nextDayOfMonth, parseIsoDate, shiftMonth,
} from '@/utils/format';

describe('format', () => {
  it('formats money with symbol and two decimals', () => {
    expect(formatMoney(1600, 'PEN')).toBe('S/ 1,600.00');
    expect(formatMoney(-12, 'USD')).toBe('−US$ 12.00');
  });
  it('signs movements', () => {
    expect(formatSignedMoney(45.9, 'PEN', false)).toBe('−S/ 45.90');
    expect(formatSignedMoney(7500, 'PEN', true)).toBe('+S/ 7,500.00');
  });
  it('formats percentages with a space', () => expect(formatPercent(91.83)).toBe('91.8 %'));
  it('parses ISO dates locally', () => expect(parseIsoDate('2026-06-03').getDate()).toBe(3));
  it('formats short and weekday dates', () => {
    expect(formatShortDate('2026-06-03', true)).toBe('03 jun. 2026');
    expect(formatWeekdayDate('2026-06-03')).toBe('Miércoles 03 jun.');
  });
  it('handles months', () => {
    expect(formatMonth('2026-06', true)).toBe('Junio 2026');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(monthRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' });
  });
  it('finds the next day of the month, clamped to short months', () => {
    expect(nextDayOfMonth(10, '2026-06-03')).toBe('2026-06-10');
    expect(nextDayOfMonth(1, '2026-06-03')).toBe('2026-07-01');
    expect(nextDayOfMonth(31, '2026-02-10')).toBe('2026-02-28');
  });
  it('builds initials', () => expect(initials('Ana Torres')).toBe('AT'));
});

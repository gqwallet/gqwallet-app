/**
 * Pure formatters for money, percentages and dates, matching the copy of the Figma mockups
 * (`S/ 1,600.00`, `US$ 34.90`, `4.7 %`, `03 jun. 2026`).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { Currency } from '@/types/api';

const SYMBOL: Record<Currency, string> = { PEN: 'S/', USD: 'US$' };

const NUMBER = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Short month names used by every date label. */
export const MONTHS_SHORT = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'set.', 'oct.', 'nov.', 'dic.'];

/** Full month names, capitalized, used by selectors and tables. */
export const MONTHS_LONG = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Returns the currency symbol.
 *
 * @param currency - Currency code.
 * @returns `S/` or `US$`.
 * @example
 * ```ts
 * currencySymbol('USD'); // 'US$'
 * ```
 */
export function currencySymbol(currency: Currency): string {
  return SYMBOL[currency];
}

/**
 * Formats an amount with its currency symbol and two decimals.
 *
 * @param amount - Amount; negative values get a typographic minus.
 * @param currency - Currency of the amount.
 * @returns Text such as `S/ 1,600.00` or `−US$ 12.00`.
 * @example
 * ```ts
 * formatMoney(1600, 'PEN'); // 'S/ 1,600.00'
 * ```
 */
export function formatMoney(amount: number, currency: Currency): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}${SYMBOL[currency]} ${NUMBER.format(Math.abs(amount))}`;
}

/**
 * Formats a movement amount with an explicit sign: plus for incomes, minus for expenses.
 *
 * @param amount - Positive amount.
 * @param currency - Currency.
 * @param isIncome - Whether the movement adds money.
 * @returns Text such as `+S/ 7,500.00` or `−S/ 45.90`.
 * @example
 * ```ts
 * formatSignedMoney(45.9, 'PEN', false); // '−S/ 45.90'
 * ```
 */
export function formatSignedMoney(amount: number, currency: Currency, isIncome: boolean): string {
  return `${isIncome ? '+' : '−'}${SYMBOL[currency]} ${NUMBER.format(Math.abs(amount))}`;
}

/**
 * Formats a plain number with thousands separators and two decimals, without symbol.
 *
 * @param amount - Amount.
 * @returns Text such as `1,600.00`.
 * @example
 * ```ts
 * formatAmount(1600); // '1,600.00'
 * ```
 */
export function formatAmount(amount: number): string {
  return NUMBER.format(amount);
}

/**
 * Formats a percentage with a space before the sign.
 *
 * @param value - Percentage, 0 to 100 or more.
 * @param decimals - Decimals to keep.
 * @returns Text such as `91.8 %`.
 * @example
 * ```ts
 * formatPercent(91.83); // '91.8 %'
 * ```
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)} %`;
}

/**
 * Parses an ISO date (`YYYY-MM-DD`) as a local date, avoiding the UTC off-by-one.
 *
 * @param iso - ISO date.
 * @returns The local date at midnight.
 * @example
 * ```ts
 * parseIsoDate('2026-06-03').getDate(); // 3
 * ```
 */
export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Converts a local date to an ISO date.
 *
 * @param date - Local date.
 * @returns ISO date `YYYY-MM-DD`.
 * @example
 * ```ts
 * toIsoDate(new Date(2026, 5, 3)); // '2026-06-03'
 * ```
 */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Returns today as an ISO date in the device time zone.
 *
 * @returns ISO date.
 * @example
 * ```ts
 * todayIso(); // '2026-06-03'
 * ```
 */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/**
 * Formats an ISO date as day and short month, optionally with year.
 *
 * @param iso - ISO date.
 * @param withYear - Appends the year.
 * @returns Text such as `03 jun.` or `03 jun. 2026`.
 * @example
 * ```ts
 * formatShortDate('2026-06-03', true); // '03 jun. 2026'
 * ```
 */
export function formatShortDate(iso: string, withYear = false): string {
  const date = parseIsoDate(iso);
  const text = `${String(date.getDate()).padStart(2, '0')} ${MONTHS_SHORT[date.getMonth()]}`;
  return withYear ? `${text} ${date.getFullYear()}` : text;
}

/**
 * Formats an ISO date with its weekday.
 *
 * @param iso - ISO date.
 * @returns Text such as `Miércoles 03 jun.`.
 * @example
 * ```ts
 * formatWeekdayDate('2026-06-03'); // weekday name, day and short month
 * ```
 */
export function formatWeekdayDate(iso: string): string {
  return `${WEEKDAYS[parseIsoDate(iso).getDay()]} ${formatShortDate(iso)}`;
}

/**
 * Returns the month (`YYYY-MM`) of an ISO date.
 *
 * @param iso - ISO date.
 * @returns Month key.
 * @example
 * ```ts
 * monthOf('2026-06-03'); // '2026-06'
 * ```
 */
export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

/**
 * Formats a month key as its name, optionally with year.
 *
 * @param period - Month key `YYYY-MM`.
 * @param withYear - Appends the year.
 * @returns Text such as `Junio 2026`.
 * @example
 * ```ts
 * formatMonth('2026-06', true); // 'Junio 2026'
 * ```
 */
export function formatMonth(period: string, withYear = false): string {
  const [year, month] = period.split('-').map(Number);
  return withYear ? `${MONTHS_LONG[month - 1]} ${year}` : MONTHS_LONG[month - 1];
}

/**
 * Shifts a month key by a number of months.
 *
 * @param period - Month key `YYYY-MM`.
 * @param delta - Months to add; negative goes back.
 * @returns The shifted month key.
 * @example
 * ```ts
 * shiftMonth('2026-01', -1); // '2025-12'
 * ```
 */
export function shiftMonth(period: string, delta: number): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Returns the first and last ISO dates of a month.
 *
 * @param period - Month key `YYYY-MM`.
 * @returns Start and end dates.
 * @example
 * ```ts
 * monthRange('2026-02'); // { from: '2026-02-01', to: '2026-02-28' }
 * ```
 */
export function monthRange(period: string): { from: string; to: string } {
  const [year, month] = period.split('-').map(Number);
  return { from: toIsoDate(new Date(year, month - 1, 1)), to: toIsoDate(new Date(year, month, 0)) };
}

/**
 * Returns the initials of a full name.
 *
 * @param name - Full name.
 * @returns Up to two uppercase letters.
 * @example
 * ```ts
 * initials('Ana Torres'); // 'AT'
 * ```
 */
export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

/**
 * Returns the next date (today or later) that falls on a day of the month, clamped to short months.
 *
 * @param day - Day of the month, 1 to 31.
 * @param from - Start date (ISO date).
 * @returns ISO date of the next occurrence.
 * @example
 * ```ts
 * nextDayOfMonth(10, '2026-06-03'); // '2026-06-10'
 * ```
 */
export function nextDayOfMonth(day: number, from: string): string {
  const start = parseIsoDate(from);
  for (let offset = 0; offset < 2; offset += 1) {
    const year = start.getFullYear();
    const month = start.getMonth() + offset;
    const last = new Date(year, month + 1, 0).getDate();
    const candidate = new Date(year, month, Math.min(day, last));
    if (candidate >= start) return toIsoDate(candidate);
  }
  return toIsoDate(new Date(start.getFullYear(), start.getMonth() + 1, Math.min(day, 28)));
}

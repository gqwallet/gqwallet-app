/**
 * Time defaults for purchases entered on the current date in Lima.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Returns the current Lima time rounded down to five minutes for today's date.
 *
 * @param economicDate - Purchase date as `YYYY-MM-DD`.
 * @param now - Current instant; defaults to the system clock.
 * @returns `HH:mm` for today in Lima, otherwise an empty string.
 */
export function limaPurchaseTime(economicDate: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  if (economicDate !== `${part('year')}-${part('month')}-${part('day')}`) return '';
  return `${part('hour')}:${String(Math.floor(Number(part('minute')) / 5) * 5).padStart(2, '0')}`;
}

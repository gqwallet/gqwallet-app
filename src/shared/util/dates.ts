// Formats a date-only string (yyyy-mm-dd) as e.g. "15 ago". Parsing must be LOCAL, not
// UTC: `new Date('2026-08-15')` is UTC midnight and renders as the previous day in any
// negative-offset timezone (e.g. Peru UTC-5). Splitting the parts avoids that off-by-one.
export function formatDateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
}

// For full ISO instants (with time), normal parsing is correct.
export function formatInstant(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

// Whole days between today and a date-only string (yyyy-mm-dd), local-parsed for the same
// reason as formatDateOnly. Both sides are clamped to midnight so "today" itself is 0.
export function daysUntil(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

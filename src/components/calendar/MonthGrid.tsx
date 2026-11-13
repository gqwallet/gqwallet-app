/**
 * Month grid with colored marks per day (17).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';
import { cardTone, type CardTone } from '@/utils/cardPalette';
import { parseIsoDate, toIsoDate } from '@/utils/format';

/** Mark shown inside a day. */
export interface DayMark {
  /** Stable key. */
  key: string;
  /** Day (ISO date). */
  date: string;
  /** Short label. */
  label: string;
  /** Card color as `#RRGGBB`, or `null` for dues. */
  color: string | null;
  /** Due status, or `null` for cards. */
  status: 'PENDING' | 'OVERDUE' | 'PAID' | null;
}

const DOT: Record<CardTone | 'pending' | 'overdue' | 'paid', string> = {
  primary: 'bg-primary',
  success: 'bg-secondary',
  warning: 'bg-tertiary',
  danger: 'bg-danger',
  caution: 'bg-caution-accent',
  pending: 'bg-caution-accent',
  overdue: 'bg-danger',
  paid: 'bg-secondary',
};
const PILL: Record<CardTone | 'pending' | 'overdue' | 'paid', string> = {
  primary: 'bg-primary-container',
  success: 'bg-secondary-container',
  warning: 'bg-tertiary-container',
  danger: 'bg-danger-container',
  caution: 'bg-caution-container',
  pending: 'bg-surface-container',
  overdue: 'bg-danger-container',
  paid: 'bg-secondary-container',
};

function toneOf(mark: DayMark): CardTone | 'pending' | 'overdue' | 'paid' {
  if (mark.status === 'OVERDUE') return 'overdue';
  if (mark.status === 'PAID') return 'paid';
  if (mark.status === 'PENDING') return 'pending';
  return cardTone(mark.color);
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** Props of {@link MonthGrid}. */
export interface MonthGridProps {
  /** Month `YYYY-MM`. */
  period: string;
  /** Today as ISO date, highlighted. */
  today: string;
  /** Marks of the month. */
  marks: DayMark[];
}

/**
 * Renders a Monday-first month with up to three marks per day.
 *
 * @example
 * ```tsx
 * <MonthGrid period="2026-06" today="2026-06-03" marks={marks} />
 * ```
 */
export function MonthGrid({ period, today, marks }: MonthGridProps) {
  const first = parseIsoDate(`${period}-01`);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day >= 1 && day <= days ? toIsoDate(new Date(first.getFullYear(), first.getMonth(), day)) : null;
  });
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="text-center text-label text-content-secondary lg:py-1">
            <span className="lg:hidden">{weekday[0]}</span><span className="hidden lg:inline">{weekday}</span>
          </div>
        ))}
        {cells.map((date, index) =>
          date ? (
            <div key={date} className={cn('flex min-h-14 flex-col gap-1 rounded-sm border p-1.5 lg:min-h-24', date === today ? 'border-primary' : 'border-line-subtle')}>
              <span className={cn('text-caption', date === today ? 'text-primary' : 'text-content-secondary')}>{Number(date.slice(8))}</span>
              <span className="flex flex-wrap gap-1 lg:flex-col">
              {marks
                .filter((mark) => mark.date === date)
                .slice(0, 3)
                .map((mark) => (
                  <span key={mark.key} title={mark.label} className={cn('flex items-start gap-1 rounded-sm text-caption lg:px-1.5 lg:py-0.5', PILL[toneOf(mark)])}>
                    <span className={cn('size-1.5 shrink-0 rounded-full lg:mt-1', DOT[toneOf(mark)])} />
                    <span className="sr-only lg:not-sr-only lg:line-clamp-2">{mark.label}</span>
                  </span>
                ))}
              </span>
            </div>
          ) : (
            <div key={`empty-${index}`} className="min-h-14 rounded-sm border border-line-subtle bg-surface-container lg:min-h-24" />
          ),
        )}
      </div>
    </div>
  );
}

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
    <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <div className="grid min-w-160 grid-cols-7 gap-1.5">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-1 text-center text-label text-content-secondary">
            {weekday}
          </div>
        ))}
        {cells.map((date, index) =>
          date ? (
            <div key={date} className={cn('flex min-h-18 flex-col gap-1 rounded-sm border p-1.5', date === today ? 'border-primary' : 'border-line-subtle')}>
              <span className={cn('text-caption', date === today ? 'text-subtitle text-primary' : 'text-content-secondary')}>{Number(date.slice(8))}</span>
              {marks
                .filter((mark) => mark.date === date)
                .slice(0, 3)
                .map((mark) => (
                  <span key={mark.key} className={cn('flex items-start gap-1 rounded-sm px-1.5 py-0.5 text-caption', PILL[toneOf(mark)])}>
                    <span className={cn('mt-1 size-1.5 shrink-0 rounded-full', DOT[toneOf(mark)])} />
                    <span className="line-clamp-2">{mark.label}</span>
                  </span>
                ))}
            </div>
          ) : (
            <div key={`empty-${index}`} className="min-h-18 rounded-sm bg-surface-container" />
          ),
        )}
      </div>
    </div>
  );
}

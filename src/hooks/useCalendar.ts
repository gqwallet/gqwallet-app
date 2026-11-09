/**
 * Payment calendar of a month (FR-015) and the Google Calendar link (FR-016).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback, useState } from 'react';
import { useMutation } from '@/hooks/useMutation';
import { useResource } from '@/hooks/useResource';
import { cardsService } from '@/services/cards.service';
import { obligationsService } from '@/services/obligations.service';
import { overviewService } from '@/services/overview.service';
import { googleConsentUrl } from '@/services/googleAuth';
import { platformService } from '@/services/platform.service';
import type { ApiError, Currency } from '@/types/api';
import type { Card } from '@/types/card';
import type { PaymentDue } from '@/types/obligation';
import type { CalendarLink } from '@/types/platform';
import { monthRange, todayIso } from '@/utils/format';

/** Kind of a calendar mark. */
export type CalendarMarkKind = 'BILLING' | 'PAYMENT' | 'DUE';

/** Status of a fixed-payment mark. */
export type CalendarDueStatus = 'PENDING' | 'OVERDUE' | 'PAID';

/** One mark on a day. */
export interface CalendarMark {
  /** Stable key. */
  key: string;
  /** Day (ISO date). */
  date: string;
  /** Card billing, card payment or due. */
  kind: CalendarMarkKind;
  /** Title, e.g. the card or due name. */
  title: string;
  /** Card color as `#RRGGBB`, for card marks. */
  color: string | null;
  /** Due status, for due marks. */
  status: CalendarDueStatus | null;
  /** Amount, when known. */
  amount: number | null;
  /** Currency of the amount. */
  currency: Currency | null;
  /** Installment label, e.g. `12/36`. */
  installment: string | null;
}

/** Data of the calendar page. */
export interface CalendarData {
  /** Marks of the month, sorted by date. */
  marks: CalendarMark[];
  /** Cards for the legend. */
  cards: Card[];
}

/** Result of {@link useCalendar}. */
export interface CalendarState {
  /** Loaded data. */
  data: CalendarData | null;
  /** Whether it is loading. */
  isLoading: boolean;
  /** Load error. */
  error: ApiError | null;
  /** Current Google Calendar link remembered on this device. */
  link: CalendarLink | null;
  /** Links Google Calendar with an authorization code; resolves the link or `null`. */
  connect: (authorizationCode: string) => Promise<CalendarLink | null>;
  /** Revokes the link; resolves whether it succeeded. */
  disconnect: () => Promise<boolean>;
  /** Whether a link action is running. */
  isLinking: boolean;
  /** Google consent URL, `null` when the app has no Google client id. */
  consentUrl: string | null;
  /** Whether Google sync can be offered; false until the app has a Google client id. */
  isSyncAvailable: boolean;
}

const LINK_KEY = 'gqwallet.calendarLink';

function readLink(): CalendarLink | null {
  try {
    const raw = localStorage.getItem(LINK_KEY);
    return raw ? (JSON.parse(raw) as CalendarLink) : null;
  } catch {
    return null;
  }
}

function writeLink(link: CalendarLink | null) {
  try {
    if (link) localStorage.setItem(LINK_KEY, JSON.stringify(link));
    else localStorage.removeItem(LINK_KEY);
  } catch {
    // The link id is only a convenience to show its state on this device.
  }
}

function dueStatus(due: PaymentDue, today: string): CalendarDueStatus {
  if (due.status === 'PAID') return 'PAID';
  return due.dueDate < today ? 'OVERDUE' : 'PENDING';
}

/**
 * Loads the marks of a month: card billing and payment dates plus fixed-payment dues.
 *
 * @param period - Month `YYYY-MM`.
 * @returns Marks, legend cards and the link actions.
 * @example
 * ```ts
 * const { data } = useCalendar('2026-06');
 * ```
 */
export function useCalendar(period: string): CalendarState {
  const today = todayIso();
  const { data, isLoading, error } = useResource(async (signal) => {
    const { from, to } = monthRange(period);
    const [entries, dues, cards] = await Promise.all([
      overviewService.listCalendarEntries(from, to, signal),
      obligationsService.listDues(from, to, signal),
      cardsService.list(signal),
    ]);
    const billings = await Promise.all(cards.map((card) => cardsService.getNextBilling(card.id, signal)));
    const dueMarks: CalendarMark[] = dues
      .filter((due) => due.status !== 'VOIDED')
      .map((due) => ({
        key: `due-${due.id}`,
        date: due.dueDate,
        kind: 'DUE',
        title: due.description,
        color: null,
        status: dueStatus(due, today),
        amount: due.paidAmount ?? due.expectedAmount,
        currency: due.currency,
        installment: due.installment,
      }));
    const cardMarks: CalendarMark[] = entries
      .filter((entry) => entry.kind === 'BILLING' || entry.kind === 'PAYMENT')
      .map((entry, index) => {
        const card = cards.find((item) => item.name === entry.title);
        const billing = card ? billings[cards.indexOf(card)] : null;
        const isPayment = entry.kind === 'PAYMENT';
        const amount = isPayment && billing && billing.paymentDueDate === entry.date ? billing.amountDue : null;
        return {
          key: `card-${index}-${entry.date}`,
          date: entry.date,
          kind: entry.kind as CalendarMarkKind,
          title: entry.title,
          color: entry.color,
          status: null,
          amount,
          currency: card?.currency ?? null,
          installment: null,
        };
      });
    return { marks: [...dueMarks, ...cardMarks].sort((a, b) => a.date.localeCompare(b.date)), cards };
  }, [period]);

  const [link, setLink] = useState<CalendarLink | null>(readLink);
  const { submit, isSubmitting } = useMutation((run: () => Promise<CalendarLink | true>) => run());
  const connect = useCallback(
    async (authorizationCode: string) => {
      const created = (await submit(() => platformService.linkCalendar(authorizationCode))) as CalendarLink | null;
      if (created) {
        writeLink(created);
        setLink(created);
      }
      return created;
    },
    [submit],
  );
  const disconnect = useCallback(async () => {
    if (!link) return true;
    const done = await submit(async () => {
      await platformService.unlink(link.id);
      return true;
    });
    if (done) {
      writeLink(null);
      setLink(null);
    }
    return done !== null;
  }, [submit, link]);
  const consentUrl = googleConsentUrl(window.location.origin);
  return { data, isLoading, error, link, connect, disconnect, isLinking: isSubmitting, consentUrl, isSyncAvailable: consentUrl !== null };
}

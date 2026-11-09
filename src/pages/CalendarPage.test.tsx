/**
 * Tests category-aware charge wording in calendar marks and rows.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import { CalendarPage } from '@/pages/CalendarPage';
import type { CalendarMark } from '@/hooks/useCalendar';
import type { FixedPaymentKind } from '@/types/obligation';

const { marks } = vi.hoisted(() => ({ marks: [] as CalendarMark[] }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify: vi.fn() }) }));
vi.mock('@/hooks/useCalendar', () => ({
  useCalendar: () => ({ data: { marks, cards: [] }, isLoading: false, error: null, link: null, disconnect: vi.fn(), isLinking: false, consentUrl: null, isSyncAvailable: false }),
}));

const kinds: FixedPaymentKind[] = ['HOUSEHOLD_SERVICES', 'SUBSCRIPTIONS', 'MEMBERSHIPS'];

it.each(kinds)('uses charge wording for overdue %s in the grid and list', (kind) => {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  marks.splice(0, marks.length, {
    key: 'd1', date, kind: 'DUE', fixedPaymentKind: kind, title: 'Internet', color: null,
    status: 'OVERDUE', amount: 99, currency: 'PEN', installment: null,
  });
  render(<MemoryRouter><CalendarPage /></MemoryRouter>);
  expect(screen.getByText('Internet · se cobra')).toBeInTheDocument();
  expect(screen.getByText(/^01 .* · se cobra$/)).toBeInTheDocument();
  expect(screen.getByText('Cobro pendiente')).toBeInTheDocument();
  expect(screen.queryByText('Internet · vencido')).not.toBeInTheDocument();
});

/**
 * Regression proof for authoritative values and real/projected chart boundaries.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CashFlowChart } from '@/components/overview/CashFlowChart';
import type { CashFlowRow } from '@/types/overview';

afterEach(() => vi.useRealTimers());

function months(): CashFlowRow[] {
  return Array.from({ length: 12 }, (_, index) => ({
    month: `2026-${String(index + 1).padStart(2, '0')}`, incomes: 7500, outflows: 1720.5,
    accountExpenses: 100, fixedPaid: 200, cardPayments: 300, pendingCommitments: 400,
    flow: 5779.5, accumulated: index === 10 ? 148727.08 : 10000 * index, projection: index === 11,
  }));
}

it('preserves server incomes, outflows and accumulated balance independently of their components', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-15T15:00:00Z'));
  const rows = months();
  const original = structuredClone(rows);
  const { container } = render(<CashFlowChart rows={rows} currency="PEN" year="2026" />);
  expect(container.querySelector('[data-current-cash-bubble]')).toHaveTextContent('Nov · Ingresos S/ 7,500.00');
  expect(container.querySelector('[data-current-cash-bubble]')).toHaveTextContent('Nov · Salidas S/ 1,720.50');
  expect(container.querySelector('[data-current-balance-bubble]')).toHaveTextContent('Noviembre · S/ 148,727.08');
  const mobileMonth = container.querySelector('[data-cash-month="2026-11"]')!;
  expect(mobileMonth).toHaveTextContent('S/ 7.5k');
  expect(mobileMonth).toHaveTextContent('S/ 1.7k');
  expect(rows).toEqual(original);
});

it('limits the real area to confirmed rows and draws the remaining balance segment dashed', () => {
  const { container } = render(<CashFlowChart rows={months()} currency="USD" year="2026" />);
  const svg = screen.getByRole('img', { name: 'Saldo real y proyectado' });
  expect(svg.querySelectorAll('line[stroke-dasharray="5 4"]')).toHaveLength(1);
  expect(svg.querySelectorAll('ellipse')).toHaveLength(11);
  expect(svg.querySelector('[data-real-area]')).toHaveAttribute('d', expect.stringContaining('875 180 Z'));
  expect(container.querySelector('[data-cash-month="2026-12"]')).toHaveTextContent('Dic*');
  expect(screen.getByText('*Proyección: estimado según tus pagos fijos activos; no confirma movimientos.')).toBeVisible();
});

it('selects exact server values with the keyboard and announces projections without passing either end', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-15T15:00:00Z'));
  const { container } = render(<CashFlowChart rows={months().slice(9)} currency="PEN" year="2026" />);
  const chart = screen.getByRole('slider', { name: 'Explorar saldo mensual' });
  const bubble = container.querySelector('[data-current-balance-bubble]');
  expect(bubble).toHaveTextContent('Noviembre · S/ 148,727.08');
  expect(chart).toHaveClass('touch-pan-y', 'focus-visible:outline-primary');
  fireEvent.keyDown(chart, { key: 'ArrowRight' });
  expect(bubble).toHaveTextContent('Diciembre · S/ 110,000.00 · proyección*');
  expect(chart).toHaveAttribute('aria-valuenow', '3');
  expect(chart).toHaveAttribute('aria-valuetext', 'Diciembre · S/ 110,000.00 · proyección*');
  expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Diciembre · S/ 110,000.00 · proyección*');
  fireEvent.keyDown(chart, { key: 'ArrowRight' });
  expect(chart).toHaveAttribute('aria-valuenow', '3');
  fireEvent.keyDown(chart, { key: 'ArrowLeft' });
  expect(bubble).toHaveTextContent('Noviembre · S/ 148,727.08');
  fireEvent.keyDown(chart, { key: 'Home' });
  fireEvent.keyDown(chart, { key: 'ArrowLeft' });
  expect(bubble).toHaveTextContent('Octubre · S/ 90,000.00');
  expect(chart).toHaveAttribute('aria-valuenow', '1');
  fireEvent.keyDown(chart, { key: 'End' });
  expect(bubble).toHaveTextContent('Diciembre · S/ 110,000.00 · proyección*');
});

it.each(['mouse', 'touch'])('snaps %s scrubbing to the nearest month, including negative server values', pointerType => {
  const rows = months().slice(9);
  rows[0].accumulated = -931.74;
  const { container } = render(<CashFlowChart rows={rows} currency="USD" year="2026" />);
  const chart = screen.getByRole('slider');
  vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue({ left: 40, width: 300 } as DOMRect);
  for (const [clientX, expected] of [[-20, 'Octubre · −US$ 931.74'], [190, 'Noviembre · US$ 148,727.08'], [500, 'Diciembre · US$ 110,000.00 · proyección*']] as const) {
    fireEvent.pointerDown(chart, { clientX, pointerId: 1, pointerType });
    fireEvent.pointerMove(chart, { clientX, pointerId: 1, pointerType });
    expect(container.querySelector('[data-current-balance-bubble]')).toHaveTextContent(expected);
  }
  expect(container.querySelector('[data-balance-guide]')).toHaveAttribute('x1', expect.any(String));
  expect(container.querySelector('[data-selected-balance-point]')).toBeInTheDocument();
});

it('defaults to the last real month when the current month is outside the selected year', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2027-02-15T15:00:00Z'));
  const { container } = render(<CashFlowChart rows={months()} currency="PEN" year="2026" />);
  expect(container.querySelector('[data-current-balance-bubble]')).toHaveTextContent('Noviembre · S/ 148,727.08');
});

it('shows exact grouped-column values on focus and hover', () => {
  const { container } = render(<CashFlowChart rows={months().slice(10)} currency="PEN" year="2026" />);
  const december = screen.getByRole('img', { name: /Diciembre: ingresos/ });
  fireEvent.focus(december);
  expect(container.querySelector('[data-current-cash-bubble]')).toHaveTextContent('Dic* · Ingresos S/ 7,500.00');
  expect(container.querySelector('[data-current-cash-bubble]')).toHaveTextContent('Dic* · Salidas S/ 1,720.50 · proyección*');
  fireEvent.pointerEnter(screen.getByRole('img', { name: /Noviembre: ingresos/ }));
  expect(container.querySelector('[data-current-cash-bubble]')).toHaveTextContent('Nov · Salidas S/ 1,720.50');
});

it.each([
  { rows: [] },
  { rows: months().map(row => ({ ...row, incomes: 0, outflows: 0, accumulated: 0 })) },
  { rows: months().map((row, index) => ({ ...row, accumulated: -50 * (index + 1) })) },
])('renders finite geometry for empty, zero or negative balances', ({ rows }) => {
  const { container } = render(<CashFlowChart rows={rows} currency="USD" year="2025" />);
  expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  expect(container.querySelectorAll('[data-cash-month]')).toHaveLength(rows.length * 2);
});

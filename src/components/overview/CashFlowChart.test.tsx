/**
 * Regression proof for authoritative values and real/projected chart boundaries.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
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
  expect(container.querySelector('[data-current-balance-bubble]')).toHaveTextContent('Nov · S/ 148,727.08');
  const mobileMonth = container.querySelector('[data-cash-month="2026-11"]')!;
  expect(mobileMonth).toHaveTextContent('S/ 7.5k');
  expect(mobileMonth).toHaveTextContent('S/ 1.7k');
  expect(rows).toEqual(original);
});

it('limits the real area to confirmed rows and draws the remaining balance segment dashed', () => {
  const { container } = render(<CashFlowChart rows={months()} currency="USD" year="2026" />);
  const svg = screen.getByRole('img', { name: 'Saldo real y proyectado' });
  expect(svg.querySelectorAll('line[stroke-dasharray]')).toHaveLength(1);
  expect(svg.querySelectorAll('ellipse')).toHaveLength(11);
  expect(svg.querySelector('[data-real-area]')).toHaveAttribute('d', expect.stringContaining('875 180 Z'));
  expect(container.querySelector('[data-cash-month="2026-12"]')).toHaveTextContent('Dic*');
  expect(screen.getByText('*Proyección: estimado según tus pagos fijos activos; no confirma movimientos.')).toBeVisible();
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

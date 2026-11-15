/**
 * Tests cash-basis matrix concepts and independent commitment values.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { CashFlowPage } from '@/pages/CashFlowPage';

const fixture = vi.hoisted(() => ({ firstActive: 1 }));
afterEach(() => { fixture.firstActive = 1; });

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { preferredCurrency: 'PEN' } }) }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify: vi.fn() }) }));
vi.mock('@/hooks/useCashFlow', () => ({ useCashFlow: (year: number) => {
  const row = { incomes: 100, accountExpenses: 10, fixedPaid: 20, cardPayments: 30, outflows: 61, flow: 39, accumulated: 1039, pendingCommitments: 999, projection: false };
  return { data: { cashFlow: { year, currency: 'PEN', rows: Array.from({ length: 12 }, (_, index) => ({ ...row, ...(index + 1 < fixture.firstActive ? { incomes: 0, accountExpenses: 0, fixedPaid: 0, cardPayments: 0, outflows: 0, flow: 0, accumulated: 0, pendingCommitments: 0 } : {}), month: `${year}-${String(index + 1).padStart(2, '0')}`, projection: index === 11 })), total: { ...row, month: 'TOTAL' } } }, isLoading: false, error: null, exportCsv: vi.fn(), isExporting: false };
} }));

it('displays server outflows and balances without deducting informational commitments', () => {
  render(<MemoryRouter><CashFlowPage /></MemoryRouter>);
  expect(screen.getByRole('row', { name: /^Salidas efectivas/ })).toHaveTextContent('61.00');
  expect(screen.getByRole('row', { name: /^Pagos de tarjeta/ })).toHaveTextContent('30.00');
  expect(screen.getByRole('row', { name: /^Flujo de caja/ })).toHaveTextContent('39.00');
  expect(screen.getByRole('row', { name: /^Acumulado/ })).toHaveTextContent('1,039.00');
  expect(screen.getByRole('row', { name: /^Compromisos pendientes/ })).toHaveClass('italic', 'text-content-muted');
  expect(screen.getByRole('columnheader', { name: /Dic · proyección/ })).toBeVisible();
});

it('starts every chart at the first active month and retains December projections and the original KPIs', () => {
  fixture.firstActive = 11;
  const { container } = render(<MemoryRouter><CashFlowPage /></MemoryRouter>);
  const months = Array.from(container.querySelectorAll('[data-cash-month]'), node => node.getAttribute('data-cash-month')?.slice(5));
  expect(months).toEqual(['11', '12', '11', '12']);
  const balance = screen.getByRole('figure', { name: 'Saldo en cuentas al cierre de cada mes' });
  expect(balance.querySelector('figcaption')).toHaveTextContent('NovDic*');
  expect(screen.getByRole('img', { name: 'Saldo real y proyectado' }).querySelectorAll('line[stroke-dasharray="5 4"]')).toHaveLength(1);
  expect(container.querySelector('[data-cash-month]')).toHaveClass('px-3');
  expect(screen.queryByRole('columnheader', { name: 'Ene' })).not.toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Nov' })).toBeVisible();
  expect(screen.getByText('Acumulado proyectado a diciembre').closest('[data-stat-card]')).toHaveTextContent('S/ 1,039.00');
});

it('keeps the empty state and omits charts when the year has no activity', () => {
  fixture.firstActive = 13;
  render(<MemoryRouter><CashFlowPage /></MemoryRouter>);
  expect(screen.getByText(/Sin movimientos en/)).toBeVisible();
  expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

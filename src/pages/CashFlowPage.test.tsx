/**
 * Tests cash-basis matrix concepts and independent commitment values.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import { CashFlowPage } from '@/pages/CashFlowPage';

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { preferredCurrency: 'PEN' } }) }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify: vi.fn() }) }));
vi.mock('@/hooks/useCashFlow', () => ({ useCashFlow: (year: number) => {
  const row = { incomes: 100, accountExpenses: 10, fixedPaid: 20, cardPayments: 30, outflows: 61, flow: 39, accumulated: 1039, pendingCommitments: 999, projection: false };
  return { data: { cashFlow: { year, currency: 'PEN', rows: Array.from({ length: 12 }, (_, index) => ({ ...row, month: `${year}-${String(index + 1).padStart(2, '0')}`, projection: index === 11 })), total: { ...row, month: 'TOTAL' } } }, isLoading: false, error: null, exportCsv: vi.fn(), isExporting: false };
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

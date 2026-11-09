/**
 * Tests budgeted and unbudgeted groups and server-owned totals.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { BudgetPage } from '@/pages/BudgetPage';
import type { BudgetStatus } from '@/types/budget';

const { status } = vi.hoisted(() => ({ status: {
  period: '2026-11', currency: 'PEN', totalLimit: 1000, budgetedConsumption: 321, unbudgetedConsumption: 87, totalConsumption: 408, totalUsage: 32.1,
  lines: [
    { categoryId: 'budgeted', categoryName: 'Supermercado', limit: 1000, consumption: 100, balance: 900, usage: 10, state: 'NORMAL' },
    { categoryId: 'unbudgeted', categoryName: 'Transporte', limit: null, consumption: 10, balance: null, usage: null, state: 'NO_BUDGET' },
  ],
} as BudgetStatus }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { preferredCurrency: 'PEN' } }) }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify: vi.fn() }) }));
vi.mock('@/hooks/useBudget', () => ({ useBudget: () => ({ data: { status, limits: {}, categories: [] }, isLoading: false, error: null, saveLimit: vi.fn(), previewCopy: vi.fn(), copyFrom: vi.fn(), isSaving: false }) }));

it('displays split KPIs and subtotals from the API rather than summing visible categories', () => {
  render(<BudgetPage />);
  expect(screen.getByText('Gastado con presupuesto').closest('[data-stat-card]')).toHaveTextContent('S/ 321.00');
  expect(screen.getByText('Gastado sin presupuesto').closest('[data-stat-card]')).toHaveTextContent('S/ 87.00');
  expect(screen.getByText('Total gastado').closest('[data-stat-card]')).toHaveTextContent('S/ 408.00');
  const table = screen.getByRole('table', { name: /Presupuesto/ });
  expect(within(table).getByText('Con presupuesto')).toBeVisible();
  expect(within(table).getAllByText('Sin presupuesto', { exact: true })[0]).toBeVisible();
  expect(within(table).getByText('Subtotal con presupuesto').closest('tr')).toHaveTextContent('321.00');
  expect(within(table).getByText('Subtotal sin presupuesto').closest('tr')).toHaveTextContent('87.00');
  expect(table.querySelector('tfoot')).toHaveTextContent('408.00');
});

it('keeps unbudgeted consumption visible when there are no limits', () => {
  const previous = { ...status };
  Object.assign(status, { totalLimit: 0, budgetedConsumption: 0, totalUsage: null, totalConsumption: 87, lines: [status.lines[1]] });
  try {
    render(<BudgetPage />);
    expect(screen.getByText('Gastado sin presupuesto').closest('[data-stat-card]')).toHaveTextContent('S/ 87.00');
    expect(screen.getByText('Total gastado').closest('[data-stat-card]')).toHaveTextContent('S/ 87.00');
    expect(screen.getByRole('table')).toBeVisible();
  } finally { Object.assign(status, previous); }
});

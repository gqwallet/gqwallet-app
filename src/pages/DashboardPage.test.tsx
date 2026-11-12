/**
 * Tests the six dashboard figures and the single-button net position action.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it, vi } from 'vitest';
import { DashboardPage } from '@/pages/DashboardPage';

const greeting = vi.hoisted(() => ({ name: 'Ana', empty: false }));

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { firstName: greeting.name, preferredCurrency: 'PEN', monthlyIncome: 1000 } }) }));
vi.mock('@/hooks/useDashboard', () => ({ useDashboard: () => ({ isLoading: false, error: null, refetch: vi.fn(), data: {
  isEmpty: greeting.empty,
  dashboard: {
    currency: 'PEN', accountsBalance: 1000, cardsDebt: 200, netPosition: 799, monthIncomes: 500, monthIncomesCount: 3,
    monthOutflows: { accountExpenses: 10, fixedPaid: 20, cardPayments: 30, total: 61 },
    pendingCommitments: { dues: 50, cards: 60, total: 111, count: 2 }, upcomingDues: [], upcomingCards: [],
  },
  dues: { overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] },
  budget: { currency: 'PEN', lines: [], totalLimit: 1000, budgetedConsumption: 200, unbudgetedConsumption: 50, totalConsumption: 250, totalUsage: 20 },
} }) }));

it('displays all six server totals without deriving balances or outflows and opens the breakdown', () => {
  render(<MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/dashboard" element={<DashboardPage />} /><Route path="/dashboard/posicion-neta" element={<h1>Desglose abierto</h1>} /></Routes></MemoryRouter>);
  expect(document.querySelectorAll('[data-stat-card]')).toHaveLength(6);
  for (const [label, value] of [['Saldo en cuentas', 'S/ 1,000.00'], ['Deuda de tarjetas', 'S/ 200.00'], ['Posición neta', 'S/ 799.00'], ['Ingresos', 'S/ 500.00'], ['Salidas', 'S/ 61.00'], ['Compromisos', 'S/ 111.00']]) {
    expect(screen.getByText(label, { exact: true }).closest('[data-stat-card]')).toHaveTextContent(value);
  }
  expect(screen.getByText('3 ingresos')).toBeVisible();
  expect(screen.getByText('2 por vencer')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /Posición neta.*Ver desglose/ }));
  expect(screen.getByRole('heading', { name: 'Desglose abierto' })).toBeVisible();
});


it.each([
  ['  Ana María  ', false, 'Hola, Ana María'],
  ['', false, 'Hola'],
  ['   ', true, 'Hola'],
  ['Nombre'.repeat(25), true, `Hola, ${'Nombre'.repeat(25)}`],
])('shows the profile greeting for name %s and empty dashboard %s', (name, empty, expected) => {
  greeting.name = name;
  greeting.empty = empty;
  render(<MemoryRouter><DashboardPage /></MemoryRouter>);
  const heading = screen.getByRole('heading', { name: expected });
  expect(heading).toBeVisible();
  expect(heading).toHaveClass('hidden', 'lg:block');
});

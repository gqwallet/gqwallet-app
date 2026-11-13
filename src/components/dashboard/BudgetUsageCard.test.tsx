/**
 * Tests budgeted usage and the separate unbudgeted consumption note.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BudgetUsageCard } from '@/components/dashboard/BudgetUsageCard';

it('uses only the server budgeted usage and displays unbudgeted spending separately', () => {
  render(<BudgetUsageCard budget={{ period: '2026-11', currency: 'PEN', lines: [], totalLimit: 1000, budgetedConsumption: 200, unbudgetedConsumption: 900, totalConsumption: 1100, totalUsage: 20 }} monthName="noviembre" action={null} />);
  expect(screen.getByText('S/ 200.00 de S/ 1,000.00 · 20.0 %')).toBeVisible();
  expect(screen.getByText('Sin presupuesto')).toBeVisible();
  expect(screen.getByText(/^S\/ 900.00 ·/)).toBeVisible();
  expect(screen.getByText('S/ 1,100.00')).toBeVisible();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '20');
});

it.each([
  [1, '· 1 categoría$'],
  [2, '· 2 categorías$'],
])('agrees the unbudgeted category noun with %i categories', (count, text) => {
  const lines = Array.from({ length: count }, (_, index) => ({ categoryId: `c${index}`, categoryName: `Categoría ${index}`, limit: null, consumption: 10, balance: null, usage: null, state: 'NO_BUDGET' as const }));
  render(<BudgetUsageCard budget={{ period: '2026-11', currency: 'PEN', lines, totalLimit: 1000, budgetedConsumption: 200, unbudgetedConsumption: 10 * count, totalConsumption: 200 + 10 * count, totalUsage: 20 }} monthName="noviembre" action={null} />);
  expect(screen.getByText(new RegExp(text))).toBeVisible();
});

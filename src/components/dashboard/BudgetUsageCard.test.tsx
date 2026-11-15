/**
 * Tests budgeted usage and the separate unbudgeted consumption note.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { BudgetUsageCard } from '@/components/dashboard/BudgetUsageCard';

it('uses only the server budgeted usage and displays unbudgeted spending separately', () => {
  render(<BudgetUsageCard budget={{ period: '2026-11', currency: 'PEN', lines: [], totalLimit: 1000, budgetedConsumption: 200, unbudgetedConsumption: 900, totalConsumption: 1100, totalUsage: 20 }} monthName="noviembre" action={null} />);
  expect(screen.getByText('S/ 200.00 de S/ 1,000.00 · 20.0 %')).toBeVisible();
  expect(screen.getByText('Sin presupuesto')).toBeVisible();
  expect(screen.getByText(/^S\/ 900.00 ·/)).toBeVisible();
  expect(screen.getByText('S/ 1,100.00')).toBeVisible();
  const ring = screen.getByRole('img', { name: 'Con presupuesto' });
  expect(ring).toHaveTextContent('20.0 %');
  expect(ring).toHaveClass('size-budget-ring');
  const arc = ring.querySelectorAll('circle')[1];
  const [filled, circumference] = arc.getAttribute('stroke-dasharray')!.split(' ').map(Number);
  expect(filled / circumference).toBeCloseTo(0.2);
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});

it('shows three review categories, their server states and usage, and a remainder with the existing action', () => {
  const onBudget = vi.fn();
  const lines = Array.from({ length: 5 }, (_, index) => ({ categoryId: `c${index}`, categoryName: `Categoría ${index}`, limit: 100, consumption: 90 + index, balance: 10 - index, usage: index === 0 ? 92 : 125.6, state: index === 0 ? 'ATTENTION' as const : 'EXCEEDED' as const }));
  render(<BudgetUsageCard budget={{ period: '2026-11', currency: 'PEN', lines, totalLimit: 1000, budgetedConsumption: 200, unbudgetedConsumption: 0, totalConsumption: 200, totalUsage: 20 }} monthName="noviembre" action={<button onClick={onBudget}>Ver presupuesto</button>} />);
  expect(screen.getByText('Revisa 5 categorías')).toBeVisible();
  const list = screen.getByRole('list', { name: 'Categorías por revisar' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(4);
  for (const index of [0, 1, 2]) expect(within(list).getByText(`Categoría ${index}`)).toHaveClass('truncate');
  expect(within(list).queryByText('Categoría 3')).not.toBeInTheDocument();
  expect(within(list).queryByText('Categoría 4')).not.toBeInTheDocument();
  expect(within(list).getByText('Atención · 92.0 %')).toHaveClass('bg-caution-container');
  expect(within(list).getAllByText('Excedido · 125.6 %')).toHaveLength(2);
  expect(within(list).getAllByText('Excedido · 125.6 %')[0]).toHaveClass('bg-danger-container');
  expect(within(list).getByText('y 2 más')).toBeVisible();
  const callout = list.closest('.bg-tertiary-container')!;
  fireEvent.click(within(callout as HTMLElement).getByRole('button', { name: 'Ver presupuesto' }));
  expect(onBudget).toHaveBeenCalledOnce();
});

it('preserves null usage for an exceeded zero-limit category', () => {
  render(<BudgetUsageCard budget={{ period: '2026-11', currency: 'PEN', lines: [{ categoryId: 'zero', categoryName: 'Sin gasto previsto', limit: 0, consumption: 120, balance: -120, usage: null, state: 'EXCEEDED' }], totalLimit: 0, budgetedConsumption: 120, unbudgetedConsumption: 0, totalConsumption: 120, totalUsage: null }} monthName="noviembre" action={null} />);
  expect(screen.getByText('Revisa 1 categoría')).toBeVisible();
  expect(screen.getByText('Excedido · —')).toBeVisible();
  expect(screen.queryByText(/y \d+ más/)).not.toBeInTheDocument();
});

it.each([
  [1, '· 1 categoría$'],
  [2, '· 2 categorías$'],
])('agrees the unbudgeted category noun with %i categories', (count, text) => {
  const lines = Array.from({ length: count }, (_, index) => ({ categoryId: `c${index}`, categoryName: `Categoría ${index}`, limit: null, consumption: 10, balance: null, usage: null, state: 'NO_BUDGET' as const }));
  render(<BudgetUsageCard budget={{ period: '2026-11', currency: 'PEN', lines, totalLimit: 1000, budgetedConsumption: 200, unbudgetedConsumption: 10 * count, totalConsumption: 200 + 10 * count, totalUsage: 20 }} monthName="noviembre" action={null} />);
  expect(screen.getByText(new RegExp(text))).toBeVisible();
});

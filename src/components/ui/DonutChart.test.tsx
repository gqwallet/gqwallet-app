/**
 * Tests data-driven rings, including empty data and percentages above a budget limit.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DonutChart } from '@/components/ui/DonutChart';
import { UsageSummary } from '@/components/ui/UsageSummary';

it('keeps an empty track and never emits invalid geometry for empty or negative slices', () => {
  const { container, rerender } = render(<DonutChart label="Distribución vacía" segments={[]} />);
  expect(screen.getByRole('img', { name: 'Distribución vacía' })).toBeVisible();
  expect(container.querySelectorAll('circle')).toHaveLength(1);
  rerender(<DonutChart label="Distribución vacía" segments={[{ label: 'Sin consumo', value: -10, color: '1' }]} />);
  expect(container.querySelectorAll('circle')).toHaveLength(1);
  expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
});

it('preserves the server percentage above the limit while clamping the visual fill', () => {
  render(<UsageSummary title="Presupuesto" usage={150} detail="Consumo registrado" breakdown={[{ label: 'Total gastado', value: 'S/ 1,185.43' }]} />);
  expect(screen.getByText('150.0 %')).toBeVisible();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  const paths = screen.getByRole('img', { name: 'Presupuesto' }).querySelector('svg')!.querySelectorAll('circle');
  expect(paths).toHaveLength(2);
  expect(paths[1]).toHaveAttribute('stroke', 'var(--color-chart-negative)');
});

it('stacks heading and amounts on mobile so the heading keeps whole words', () => {
  render(<UsageSummary title="Con presupuesto" usage={44} detail="S/ 553.98 de S/ 1,260.00 · 44.0 %" breakdown={[{ label: 'Total gastado', value: 'S/ 1,185.43' }]} />);
  const heading = screen.getByText('Con presupuesto');
  expect(heading.parentElement).toHaveClass('flex-col', 'lg:flex-row');
  expect(heading).not.toHaveClass('[overflow-wrap:anywhere]');
  expect(screen.getByText('44.0 %')).toHaveClass('whitespace-nowrap');
});

it('keeps each breakdown figure on its own label/value row on mobile', () => {
  render(<UsageSummary title="Con presupuesto" usage={44} detail="S/ 553.98 de S/ 1,260.00 · 44.0 %"
    breakdown={[{ label: 'Sin presupuesto', value: 'S/ 631.45 · 4 categorías' }, { label: 'Total gastado', value: 'S/ 1,185.43' }]} />);
  const labels = screen.getAllByRole('term').map((term) => term.textContent);
  expect(labels).toEqual(['Sin presupuesto', 'Total gastado']);
  expect(screen.getAllByRole('term')[0].closest('dl')).toHaveClass('flex-col', 'lg:flex-row');
  expect(screen.getByText('S/ 631.45 · 4 categorías').parentElement).toHaveClass('justify-between');
});

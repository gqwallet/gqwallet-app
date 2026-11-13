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
  render(<UsageSummary title="Presupuesto" usage={150} detail="Consumo registrado" note="Referencia" showBar />);
  expect(screen.getByText('150.0 %')).toBeVisible();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  const paths = screen.getByRole('img', { name: 'Presupuesto' }).querySelectorAll('circle');
  expect(paths).toHaveLength(2);
  expect(paths[1]).toHaveAttribute('stroke', 'var(--color-chart-negative)');
});

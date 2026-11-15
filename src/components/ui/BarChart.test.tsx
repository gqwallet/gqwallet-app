/**
 * Tests of the refreshed bar chart rails.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BarChart } from '@/components/ui/BarChart';

it('scales bars inside rails and labels empty months', () => {
  const { container } = render(<BarChart label="Evolución mensual" data={[{ label: 'Oct', value: 200, valueLabel: '200.00' }, { label: 'Nov', value: 100, valueLabel: '100.00' }, { label: 'Dic', value: null }]} emptyText="Sin datos" />);
  expect(screen.getByRole('figure', { name: 'Evolución mensual' })).toBeInTheDocument();
  const bars = [...container.querySelectorAll<HTMLElement>('[style]')];
  expect(bars.map((bar) => bar.style.height)).toEqual(['126px', '63px']);
  expect(bars[0]).toHaveClass('rounded-[10px]');
  expect(screen.getByText('Sin datos')).toBeInTheDocument();
  expect(screen.getByText('200.00')).toBeInTheDocument();
});

it('draws the threshold on the same scale as the bars', () => {
  const { container } = render(<BarChart label="Carga de deuda" data={[{ label: 'Oct', value: 10 }]} threshold={20} />);
  const line = container.querySelector<HTMLElement>('.bg-danger');
  expect(line?.style.bottom).toBe('126px');
});

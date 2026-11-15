/**
 * Tests of optional statistic navigation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { StatCard } from '@/components/ui/StatCard';

it('displays a static figure or activates a callback', () => {
  const onClick = vi.fn();
  const { rerender } = render(<StatCard label="Disponible" value="S/ 10.00" detail="Original" />);
  const amount = screen.getByText('Disponible').closest('[data-stat-card]')!.querySelector('[data-stat-value]');
  expect(amount).toBeVisible();
  expect(amount!.textContent).toBe('S/ 10.00');
  expect(amount!.querySelector('span')).toHaveTextContent('.00');
  expect(amount!.querySelector('span')).toHaveClass('text-[16px]');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(<StatCard label="Disponible" value="S/ 10.00" onClick={onClick} />);
  fireEvent.click(screen.getByRole('button', { name: /Disponible\s*S\/ 10\.00/ }));
  expect(onClick).toHaveBeenCalledOnce();
});

it('keeps a link-style action inside one keyboard-accessible card button', () => {
  const onClick = vi.fn();
  render(<StatCard label="Posición neta" value="S/ 25.00" actionLabel="Ver desglose" onClick={onClick} />);
  const button = screen.getByRole('button', { name: /Posición neta.*Ver desglose/ });
  expect(screen.getAllByRole('button')).toHaveLength(1);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText('Ver desglose').tagName).toBe('SPAN');
  expect(screen.getByText('Posición neta')).toHaveClass('min-h-4', 'text-body-s', '[overflow-wrap:anywhere]');
  expect(screen.getByText('Ver desglose').parentElement).toHaveClass('min-h-4');
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledOnce();
});

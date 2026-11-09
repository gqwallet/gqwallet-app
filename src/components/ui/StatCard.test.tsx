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
  expect(screen.getByText('S/ 10.00')).toBeVisible();
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
  expect(screen.getByText('Posición neta')).toHaveClass('min-h-10', 'line-clamp-2');
  expect(screen.getByText('Ver desglose').parentElement).toHaveClass('mt-auto');
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledOnce();
});

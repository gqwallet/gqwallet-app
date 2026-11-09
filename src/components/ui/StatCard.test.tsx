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

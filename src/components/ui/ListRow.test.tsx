/**
 * Tests of row detail and optional activation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ListRow } from '@/components/ui/ListRow';

it('displays detail and becomes an action only when a callback is provided', () => {
  const onClick = vi.fn();
  const { rerender } = render(<ListRow title="Transferencia" detail="Reserva mensual" amount="S/ 300.00" />);
  expect(screen.getByText('Reserva mensual')).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(<ListRow title="Transferencia" detail="Reserva mensual" amount="S/ 300.00" onClick={onClick} />);
  fireEvent.click(screen.getByRole('button', { name: /Transferencia\s*Reserva mensual/ }));
  expect(onClick).toHaveBeenCalledOnce();
});

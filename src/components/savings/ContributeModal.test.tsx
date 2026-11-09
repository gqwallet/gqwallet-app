/**
 * Tests of the optional contribution description.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ContributeModal } from '@/components/savings';

it('limits and submits the optional description with the contribution', () => {
  const onSubmit = vi.fn();
  render(<ContributeModal goalName="Reserva" currency="PEN" accounts={[{ id: 'a1', alias: 'BCP', currency: 'PEN', balance: 100 }]} isSaving={false} error={null} onSubmit={onSubmit} onClose={vi.fn()} />);
  expect(screen.getByLabelText('Descripción (opcional)')).toHaveAttribute('maxlength', '120');
  fireEvent.change(screen.getByLabelText('Importe'), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText('Descripción (opcional)'), { target: { value: ' Reserva mensual ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Registrar aporte' }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amount: 10, description: 'Reserva mensual' }));
});

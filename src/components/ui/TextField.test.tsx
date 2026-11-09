/**
 * Tests of labeled input changes, hints and native restrictions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { TextField } from '@/components/ui/TextField';

it('labels the input, emits text and associates its hint or error', () => {
  const onChange = vi.fn();
  const { rerender } = render(<TextField label="Nombre" value="Ana" onChange={onChange} helper="Tu nombre" />);
  const input = screen.getByRole('textbox', { name: 'Nombre' });
  expect(input).toHaveValue('Ana');
  expect(input).toHaveAccessibleDescription('Tu nombre');
  fireEvent.change(input, { target: { value: 'María' } });
  expect(onChange).toHaveBeenCalledWith('María');
  rerender(<TextField label="Nombre" value="" onChange={onChange} helper="Tu nombre" error="Es obligatorio" required />);
  expect(input).toBeInvalid();
  expect(input).toBeRequired();
  expect(input).toHaveAccessibleDescription('Es obligatorio');
  expect(screen.getByRole('alert')).toHaveTextContent('Es obligatorio');
  expect(screen.queryByText('Tu nombre')).not.toBeInTheDocument();
});

it.each([{ readOnly: true }, { disabled: true }])('does not edit when %o', async (state) => {
  const onChange = vi.fn();
  render(<TextField label="Correo" value="ana@correo.pe" onChange={onChange} {...state} />);
  await userEvent.type(screen.getByLabelText('Correo'), 'x');
  expect(onChange).not.toHaveBeenCalled();
});

it('raises a typed date earlier than min to min when leaving the field', () => {
  const onChange = vi.fn();
  render(<TextField label="Fecha" type="date" min="2026-10-01" value="2026-09-15" onChange={onChange} />);
  fireEvent.blur(screen.getByLabelText('Fecha'));
  expect(onChange).toHaveBeenCalledWith('2026-10-01');
});

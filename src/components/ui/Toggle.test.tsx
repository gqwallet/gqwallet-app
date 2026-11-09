/**
 * Tests of switch state, keyboard interaction and disabled behavior.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Toggle } from '@/components/ui/Toggle';

it('announces its state and requests the opposite state by keyboard', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { rerender } = render(<Toggle label="Activar" isOn={false} onChange={onChange} />);
  const control = screen.getByRole('switch', { name: 'Activar' });
  expect(control).not.toBeChecked();
  await user.tab();
  await user.keyboard(' ');
  expect(onChange).toHaveBeenLastCalledWith(true);
  rerender(<Toggle label="Activar" isOn onChange={onChange} />);
  expect(control).toBeChecked();
  await user.click(control);
  expect(onChange).toHaveBeenLastCalledWith(false);
});

it('blocks interaction when disabled and announces errors instead of descriptions', async () => {
  const onChange = vi.fn();
  render(<Toggle label="Activar" description="Ayuda" error="No disponible" isOn={false} isDisabled onChange={onChange} />);
  expect(screen.getByRole('alert')).toHaveTextContent('No disponible');
  expect(screen.queryByText('Ayuda')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('switch'));
  expect(screen.getByRole('switch')).toBeDisabled();
  expect(onChange).not.toHaveBeenCalled();
});

/**
 * Tests of chip picker opening, selection and cancellation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ChipPicker } from '@/components/ui/ChipPicker';

it('opens choices, emits the selection and closes; cancellation preserves the value', () => {
  const onChange = vi.fn();
  render(<ChipPicker title="Elige" value="PEN" options={[{ value: 'PEN', label: 'Soles' }, { value: 'USD', label: 'Dólares' }]} onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: 'Soles' }));
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Elige' })).getByRole('button', { name: 'Dólares' }));
  expect(onChange).toHaveBeenCalledWith('USD');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Soles' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onChange).toHaveBeenCalledOnce();
});

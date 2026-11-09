/**
 * Tests of chip selection and grouped values.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Chip, ChipGroup } from '@/components/ui/Chip';

it('announces selection and activates its action', () => {
  const onClick = vi.fn();
  render(<Chip label="Soles" isSelected onClick={onClick} />);
  fireEvent.click(screen.getByRole('button', { name: 'Soles', pressed: true }));
  expect(onClick).toHaveBeenCalledOnce();
});

it('emits the grouped option value and shows the current selection', () => {
  const onChange = vi.fn();
  render(<ChipGroup label="Moneda" value="PEN" options={[{ value: 'PEN', label: 'Soles' }, { value: 'USD', label: 'Dólares' }]} onChange={onChange} />);
  expect(screen.getByRole('group', { name: 'Moneda' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Soles' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Dólares', pressed: false }));
  expect(onChange).toHaveBeenCalledWith('USD');
});

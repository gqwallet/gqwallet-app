/**
 * Tests of accessible select choices, validation hints and disabled state.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { SelectField } from '@/components/ui/SelectField';

const options = [{ value: 'PEN', label: 'Soles' }, { value: 'USD', label: 'Dólares' }];

it('labels the select and emits the chosen option value', async () => {
  const onChange = vi.fn();
  render(<SelectField label="Moneda" value="" placeholder="Elige" options={options} onChange={onChange} helper="Moneda principal" />);
  const select = screen.getByRole('combobox', { name: 'Moneda' });
  expect(select).toHaveValue('');
  expect(select).toHaveAccessibleDescription('Moneda principal');
  await userEvent.selectOptions(select, 'USD');
  expect(onChange).toHaveBeenCalledWith('USD');
});

it('announces errors and blocks changes when disabled', async () => {
  const onChange = vi.fn();
  render(<SelectField label="Moneda" value="PEN" options={options} onChange={onChange} disabled error="Elige otra moneda" helper="Ayuda" />);
  const select = screen.getByRole('combobox');
  expect(select).toBeDisabled();
  expect(select).toBeInvalid();
  expect(select).toHaveAccessibleDescription('Elige otra moneda');
  expect(screen.getByRole('alert')).toBeVisible();
  expect(screen.queryByText('Ayuda')).not.toBeInTheDocument();
  await userEvent.selectOptions(select, 'USD');
  expect(onChange).not.toHaveBeenCalled();
});

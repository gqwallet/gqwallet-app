/**
 * Tests of the onboarding name requirements and skip action.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { OnboardingPage } from '@/pages/OnboardingPage';

const { save, finishSetup } = vi.hoisted(() => ({ save: vi.fn(), finishSetup: vi.fn() }));
vi.mock('@/hooks/useProfileForm', () => ({ useProfileForm: () => ({ profile: null, save, isSaving: false, error: null }) }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ finishSetup }) }));
beforeEach(() => { vi.clearAllMocks(); save.mockResolvedValue(true); });

it('requires separate names before saving and limits each to 150 characters', async () => {
  render(<MemoryRouter><OnboardingPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));
  expect(save).not.toHaveBeenCalled();
  const firstName = screen.getByLabelText('Nombre');
  const lastName = screen.getByLabelText('Apellido');
  expect(firstName).toBeRequired();
  expect(lastName).toHaveAttribute('maxlength', '150');
  fireEvent.change(firstName, { target: { value: 'Ana María' } });
  fireEvent.change(lastName, { target: { value: 'Torres Pérez' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));
  expect(save).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Ingreso mensual de referencia'), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText('Colchón de vida'), { target: { value: '50' } });
  fireEvent.click(screen.getByRole('button', { name: 'USD · Dólares' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Ana María', lastName: 'Torres Pérez', preferredCurrency: 'USD', monthlyIncome: 100, lifeCushion: 50 })));
  await waitFor(() => expect(finishSetup).toHaveBeenCalledOnce());
});

it('skips the entire setup without saving invented names or financial data', () => {
  render(<MemoryRouter><OnboardingPage /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Omitir por ahora' }));
  expect(finishSetup).toHaveBeenCalledOnce();
  expect(save).not.toHaveBeenCalled();
});

it.each([['', ''], ['100', ''], ['', '10'], ['0', '10'], ['100', '0'], ['-100', '10'], ['100', '-10'], ['abc', '10'], ['100', 'abc'], ['100', '101']])('rejects income %s and cushion %s without finishing setup', (income, cushion) => {
  render(<MemoryRouter><OnboardingPage /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Torres' } });
  fireEvent.change(screen.getByLabelText('Ingreso mensual de referencia'), { target: { value: income } });
  fireEvent.change(screen.getByLabelText('Colchón de vida'), { target: { value: cushion } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));
  expect(screen.getByRole('alert')).toBeVisible();
  expect(save).not.toHaveBeenCalled();
  expect(finishSetup).not.toHaveBeenCalled();
});

it('accepts a cushion equal to the positive income', async () => {
  render(<MemoryRouter><OnboardingPage /></MemoryRouter>);
  for (const [label, value] of [['Nombre', 'Ana'], ['Apellido', 'Torres'], ['Ingreso mensual de referencia', '100'], ['Colchón de vida', '100']]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ monthlyIncome: 100, lifeCushion: 100 })));
});

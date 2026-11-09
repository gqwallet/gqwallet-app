/**
 * Tests of personal data and API-backed financial preferences.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { ProfilePage } from '@/pages/ProfilePage';

const { save, notify } = vi.hoisted(() => ({ save: vi.fn(), notify: vi.fn() }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: { email: 'ana@correo.pe' } }) }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify }) }));
vi.mock('@/hooks/useProfileForm', () => ({ useProfileForm: () => ({ profile: { firstName: 'Ana María', lastName: 'Torres Pérez', birthDate: '1995-03-14', preferredCurrency: 'PEN', monthlyIncome: 100, lifeCushion: 10, debtLoadThreshold: 12.5 }, save, isSaving: false, error: null }) }));
beforeEach(() => { vi.clearAllMocks(); save.mockResolvedValue(true); });

it('keeps multiword names separate and sends the chosen birth date', async () => {
  render(<ProfilePage />);
  expect(screen.getByLabelText('Nombre')).toHaveValue('Ana María');
  expect(screen.getByLabelText('Apellido')).toHaveValue('Torres Pérez');
  expect(screen.queryByLabelText(/Teléfono/)).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento (opcional)'), { target: { value: '1992-07-15' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar datos' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Ana María', lastName: 'Torres Pérez', birthDate: '1992-07-15' })));
});

it('clears the birth date with null', async () => {
  render(<ProfilePage />);
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento (opcional)'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar datos' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ birthDate: null })));
});

it('loads and saves the server threshold while preserving the birth date', async () => {
  render(<ProfilePage />);
  expect(screen.getByLabelText('Umbral de carga de deuda')).toHaveValue('12.5');
  fireEvent.change(screen.getByLabelText('Umbral de carga de deuda'), { target: { value: '15.25' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar parámetros' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ debtLoadThreshold: 15.25, birthDate: '1995-03-14' })));
});

it('rejects future birth dates and percentages below the API minimum', () => {
  render(<ProfilePage />);
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento (opcional)'), { target: { value: '2999-01-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar datos' }));
  expect(screen.getByText('La fecha de nacimiento debe ser anterior a hoy.')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Umbral de carga de deuda'), { target: { value: '0.001' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar parámetros' }));
  expect(screen.getByText('Ingresa un porcentaje entre 0.01 % y 100 %.')).toBeVisible();
  expect(save).not.toHaveBeenCalled();
});

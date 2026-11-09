/**
 * Tests of the transfer description field and submitted values.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { NewTransferPage } from '@/pages/NewTransferPage';

const paymentCycles: [] = [];
const { submit } = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify: vi.fn() }) }));
vi.mock('@/hooks/useTransferForm', () => ({ useTransferForm: () => ({ paymentCycles, cyclesLoading: false, cyclesError: null, lookups: { accounts: [{ id: 'a1', alias: 'BCP', currency: 'PEN', balance: 100 }, { id: 'a2', alias: 'Ahorro', currency: 'PEN', balance: 20 }], goals: [], cards: [] }, isLoading: false, loadError: null, submit, suggestCardPayment: vi.fn(), isSaving: false, saveError: null }) }));
beforeEach(() => { vi.clearAllMocks(); submit.mockResolvedValue(false); });

it.each(['Reserva mensual', ''])('sends the optional description %s', async (description) => {
  render(<MemoryRouter><NewTransferPage /></MemoryRouter>);
  const field = screen.getByLabelText('Descripción (opcional)');
  expect(field).toHaveAttribute('maxlength', '120');
  fireEvent.change(screen.getByLabelText('Cuenta de destino'), { target: { value: 'a2' } });
  fireEvent.change(screen.getByLabelText('Importe'), { target: { value: '10' } });
  fireEvent.change(field, { target: { value: description } });
  fireEvent.click(screen.getByRole('button', { name: 'Registrar transferencia' }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ sourceAccountId: 'a1', targetId: 'a2', amount: 10, description: description || null })));
});

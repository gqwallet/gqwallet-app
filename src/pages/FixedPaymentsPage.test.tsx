/**
 * Tests the monthly due skip flow through the page, mutation and confirmation dialog.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { FixedPaymentsPage } from '@/pages/FixedPaymentsPage';
import { ApiError } from '@/types/api';
import type { PaymentDue, UpcomingDues } from '@/types/obligation';

const { notify, obligationsService } = vi.hoisted(() => ({
  notify: vi.fn(),
  obligationsService: { getUpcoming: vi.fn(), listDues: vi.fn(), list: vi.fn(), settle: vi.fn(), voidDue: vi.fn() },
}));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify }) }));
vi.mock('@/services/obligations.service', () => ({ obligationsService }));
vi.mock('@/services/transactions.service', () => ({ transactionsService: { listCategories: vi.fn().mockResolvedValue([]) } }));
vi.mock('@/services/accounts.service', () => ({ accountsService: { list: vi.fn().mockResolvedValue([]) } }));
vi.mock('@/services/cards.service', () => ({ cardsService: { list: vi.fn().mockResolvedValue([]) } }));

const due: PaymentDue = {
  id: 'd1', fixedPaymentId: 'f1', description: 'Internet', kind: 'HOUSEHOLD_SERVICES',
  dueDate: '2026-11-20', expectedAmount: 99, paidAmount: null, currency: 'PEN', installment: null,
  usualPaymentMethodKind: null, usualInstrumentId: null, status: 'PENDING',
};
const emptyDues: UpcomingDues = { overdue: [], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(obligationsService.getUpcoming).mockResolvedValue({ ...emptyDues, today: [due] });
  vi.mocked(obligationsService.listDues).mockResolvedValue([due]);
  vi.mocked(obligationsService.list).mockResolvedValue([]);
});

async function openSkipConfirmation() {
  render(<MemoryRouter><FixedPaymentsPage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: /Internet/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
}

it('closes the confirmation, removes the pending due and notifies after a successful skip', async () => {
  const voided: PaymentDue = { ...due, status: 'VOIDED' };
  vi.mocked(obligationsService.voidDue).mockResolvedValueOnce(voided);
  await openSkipConfirmation();
  expect(obligationsService.voidDue).not.toHaveBeenCalled();
  vi.mocked(obligationsService.getUpcoming).mockResolvedValueOnce(emptyDues);
  vi.mocked(obligationsService.listDues).mockResolvedValueOnce([voided]);
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  await waitFor(() => expect(notify).toHaveBeenCalledWith({ title: 'Vencimiento omitido' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(await screen.findByText('No tienes vencimientos pendientes')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Internet/ })).not.toBeInTheDocument();
  expect(obligationsService.voidDue).toHaveBeenCalledExactlyOnceWith('d1');
  expect(obligationsService.getUpcoming).toHaveBeenCalledTimes(2);
  expect(obligationsService.settle).not.toHaveBeenCalled();
});

it('keeps a rejected skip open with an error and allows a successful retry', async () => {
  vi.mocked(obligationsService.voidDue).mockRejectedValueOnce(new ApiError(409));
  await openSkipConfirmation();
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Este vencimiento ya no está pendiente.');
  expect(screen.getByRole('dialog', { name: /¿Omitir el vencimiento/ })).toBeInTheDocument();
  expect(notify).not.toHaveBeenCalled();
  expect(obligationsService.getUpcoming).toHaveBeenCalledTimes(1);
  vi.mocked(obligationsService.voidDue).mockResolvedValueOnce({ ...due, status: 'VOIDED' });
  vi.mocked(obligationsService.getUpcoming).mockResolvedValueOnce(emptyDues);
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  await waitFor(() => expect(notify).toHaveBeenCalledWith({ title: 'Vencimiento omitido' }));
  expect(await screen.findByText('No tienes vencimientos pendientes')).toBeInTheDocument();
});

it('clears skip errors when the payment dialog is closed and reopened', async () => {
  vi.mocked(obligationsService.voidDue).mockRejectedValueOnce(new ApiError(500));
  await openSkipConfirmation();
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByRole('button', { name: /Internet/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(notify).not.toHaveBeenCalled();
  expect(obligationsService.voidDue).toHaveBeenCalledTimes(1);
});

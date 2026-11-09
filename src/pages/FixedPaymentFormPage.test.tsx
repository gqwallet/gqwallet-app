/**
 * Tests that editing preserves previously paid installments and server due labels.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { FixedPaymentFormPage } from '@/pages/FixedPaymentFormPage';
import type { FixedPayment, PaymentDue } from '@/types/obligation';

const { update } = vi.hoisted(() => ({ update: vi.fn() }));
const payment: FixedPayment = {
  id: 'f1', description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE', budgetCategoryId: 'c1',
  amount: 250, currency: 'PEN', dueDay: 28, startMonth: '2026-10', totalInstallments: 24,
  paidInstallments: 13, status: 'ACTIVE',
};
const due: PaymentDue = {
  id: 'd1', fixedPaymentId: 'f1', description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE',
  dueDate: '2026-10-28', expectedAmount: 250, paidAmount: null, currency: 'PEN', installment: '14/24',
  usualPaymentMethodKind: null, usualInstrumentId: null, status: 'PENDING',
};
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { preferredCurrency: 'PEN' } }) }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify: vi.fn() }) }));
vi.mock('@/hooks/useFixedPaymentForm', () => ({
  useFixedPaymentForm: () => ({
    data: { fixedPayment: payment, dues: [due], categories: [{ id: 'c1', name: 'Servicios' }], accounts: [], cards: [] },
    isLoading: false, error: null, register: vi.fn(), update, finish: vi.fn(), isSaving: false, saveError: null,
  }),
}));
beforeEach(() => { vi.clearAllMocks(); update.mockResolvedValue(null); });

it('keeps the backend installment label without applying the paid offset twice', () => {
  render(<MemoryRouter><FixedPaymentFormPage /></MemoryRouter>);
  expect(screen.getByText('Cuota 14/24')).toBeInTheDocument();
  expect(screen.getByText('Consumo en cuotas · S/ 250.00 al mes · cuota 14 de 24')).toBeInTheDocument();
});

it('includes the saved paid count in the update payload', async () => {
  render(<MemoryRouter initialEntries={['/pagos-fijos/f1/editar']}><Routes><Route path="/pagos-fijos/:id/editar" element={<FixedPaymentFormPage />} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(update).toHaveBeenCalledWith({
    description: 'iPhone 16 Pro', budgetCategoryId: 'c1', amount: 250, dueDay: 28,
    paidInstallments: 13, usualPaymentMethodKind: null, usualInstrumentId: null,
  }));
});

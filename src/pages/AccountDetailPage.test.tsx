/**
 * Tests of account activity descriptions in the account detail page.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import { AccountDetailPage } from '@/pages/AccountDetailPage';

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { countryCode: 'PE' } }) }));
vi.mock('@/hooks/useBanks', () => ({ useBanks: () => ({ data: [] }) }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify: vi.fn() }) }));
vi.mock('@/hooks/useAccountDetail', () => ({ useAccountDetail: () => ({
  data: {
    account: { id: 'a1', alias: 'Interbank Ahorro', bankName: 'Interbank', type: 'SAVINGS', currency: 'PEN', openingBalance: 1000, openingBalanceAsOf: '2026-06-01', status: 'ACTIVE' },
    breakdown: { opening: 1000, incomes: 0, expenses: 0, transfersOut: 0, transfersIn: 300, balance: 1300 },
    recent: [{ id: 'x1', type: 'transfer', title: 'Transferencia', date: '2026-06-03', detail: 'Reserva mensual entre cuentas', signedAmount: 300 }], movementCount: 0,
  }, isLoading: false, error: null, isSaving: false, saveError: null, update: vi.fn(), deactivate: vi.fn(),
}) }));

it('shows the incoming transfer description, date and amount in recent activity', () => {
  render(<MemoryRouter><AccountDetailPage /></MemoryRouter>);
  expect(screen.getByText('Transferencia', { exact: true })).toBeVisible();
  expect(screen.getByText(/Reserva mensual entre cuentas ·/)).toBeVisible();
  expect(screen.getByText('+S/ 300.00')).toBeVisible();
});

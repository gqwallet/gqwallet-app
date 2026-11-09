/**
 * Tests that payment instruments retain their server labels and slices.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ReportsPage } from '@/pages/ReportsPage';

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { preferredCurrency: 'PEN' } }) }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify: vi.fn() }) }));
vi.mock('@/hooks/useReports', () => ({ useReports: () => ({ expense: { total: 100, average: 25, max: 40, min: 10, transactions: 4, monthly: [], topCategories: [], topMerchants: [], byPaymentMethod: [
  { label: 'ACCOUNT', amount: 40, share: 40 },
  { label: 'Visa Interbank', amount: 30, share: 30 },
  { label: 'Sin medio de pago', amount: 20, share: 20 },
  { label: 'Medio no disponible', amount: 10, share: 10 },
], byEssentiality: [], byMood: [] }, income: null, isLoading: false, error: null, exportCsv: vi.fn(), isExporting: false }) }));

it('renders each payment instrument exactly as returned without translating aliases', () => {
  render(<ReportsPage />);
  for (const label of ['ACCOUNT', 'Visa Interbank', 'Sin medio de pago', 'Medio no disponible']) {
    expect(screen.getByRole('progressbar', { name: label })).toBeVisible();
  }
  expect(screen.queryByText('Cuentas')).not.toBeInTheDocument();
  expect(screen.getByRole('progressbar', { name: 'ACCOUNT' })).toHaveAttribute('aria-valuenow', '40');
});

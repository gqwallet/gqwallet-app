/**
 * Tests of the unavailable-rate notice and the exchange-rate route.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { ConsolidatedPage } from '@/pages/ConsolidatedPage';

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { preferredCurrency: 'PEN' } }) }));
const { state } = vi.hoisted(() => ({ state: { position: { targetCurrency: null as 'PEN' | 'USD' | null, available: false, penAvailable: 150 as number | null, usdAvailable: 20 as number | null, rate: null as number | null, consolidated: null as number | null } } }));
vi.mock('@/hooks/useConsolidatedView', () => ({ useConsolidatedView: () => ({ data: { position: state.position, flow: { month: 6, pen: 10, usd: 5, consolidated: null } }, isLoading: false, error: null, registerRate: vi.fn(), isSaving: false, saveError: null }) }));
beforeEach(() => { Object.assign(state.position, { targetCurrency: null, available: false, penAvailable: 150, usdAvailable: 20, rate: null, consolidated: null }); });

it('shows the Figma notice and navigates to the exchange-rate form', () => {
  render(<MemoryRouter><ConsolidatedPage /></MemoryRouter>);
  expect(screen.getByText('Registra un tipo de cambio')).toBeVisible();
  expect(screen.getByText('Para mostrar una vista consolidada necesitamos un tipo de cambio y su fecha. Mientras tanto, no sumamos tus monedas.')).toBeVisible();
  expect(screen.getByText('S/ 150.00')).toBeVisible();
  expect(screen.getByText('US$ 20.00')).toBeVisible();
  expect(screen.getByText('S/ 10.00')).toBeVisible();
  expect(screen.getByText('US$ 5.00')).toBeVisible();
  expect(screen.queryByText(/Flujo referencial/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Total referencial/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Registrar tipo de cambio' }));
  expect(screen.getByRole('dialog', { name: 'Registrar tipo de cambio' })).toBeVisible();
  expect(screen.getByLabelText('Soles por 1 dólar')).toBeVisible();
});

it('handles null balances without inventing zero amounts', () => {
  Object.assign(state.position, { penAvailable: null, usdAvailable: null });
  render(<MemoryRouter><ConsolidatedPage /></MemoryRouter>);
  expect(screen.getByText('Registra un tipo de cambio')).toBeVisible();
  expect(screen.queryByText('Disponible en soles')).not.toBeInTheDocument();
  expect(screen.queryByText('Disponible en dólares')).not.toBeInTheDocument();
  expect(screen.queryByText(/Total referencial/)).not.toBeInTheDocument();
});

it('shows a returned zero balance independently of a missing foreign balance', () => {
  Object.assign(state.position, { penAvailable: 0, usdAvailable: null });
  render(<MemoryRouter><ConsolidatedPage /></MemoryRouter>);
  expect(screen.getByText('S/ 0.00')).toBeVisible();
  expect(screen.queryByText('Disponible en dólares')).not.toBeInTheDocument();
});

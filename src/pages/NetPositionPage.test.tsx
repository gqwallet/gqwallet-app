/**
 * Tests server-owned net position totals and currency selection.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import { NetPositionPage } from '@/pages/NetPositionPage';
import { useNetPosition } from '@/hooks/useNetPosition';

vi.mock('@/hooks/useNetPosition', () => ({ useNetPosition: vi.fn(() => ({ data: {
  currency: 'USD', accounts: [{ accountId: 'a1', name: 'Cuenta', balance: 1000 }], accountsBalance: 999,
  cards: [{ cardId: 'c1', name: 'Visa', debt: 300 }], cardsDebt: 299, netPosition: 699,
  commitments: { dues: 50, cards: 90, total: 141, count: 2 },
}, isLoading: false, error: null, refetch: vi.fn() })) }));

it('shows accounts, cards and totals exactly as returned without subtracting commitments', () => {
  render(<MemoryRouter initialEntries={['/dashboard/posicion-neta?moneda=USD']}><NetPositionPage /></MemoryRouter>);
  expect(useNetPosition).toHaveBeenCalledWith('USD');
  expect(screen.getByText('Total en cuentas').parentElement).toHaveTextContent('US$ 999.00');
  expect(screen.getByText('Total de deuda').parentElement).toHaveTextContent('US$ 299.00');
  expect(screen.getAllByText('US$ 699.00')).toHaveLength(2);
  expect(screen.getByRole('heading', { name: /^Desglose al / })).toBeVisible();
  expect(screen.getByText('2 compromisos').parentElement).toHaveTextContent('US$ 141.00');
  fireEvent.change(screen.getByLabelText('Moneda'), { target: { value: 'PEN' } });
  expect(useNetPosition).toHaveBeenLastCalledWith('PEN');
});

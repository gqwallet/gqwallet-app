/**
 * Tests same-cycle billing dates, billing tenses and per-card line usage on dashboard cards.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UpcomingCardsCard } from '@/components/dashboard/UpcomingCardsCard';
import type { DashboardCard } from '@/types/overview';

const card: DashboardCard = {
  cardId: 'c1', status: 'PENDING', name: 'Visa', currency: 'PEN', color: '#3333B2', amountDue: 250,
  paymentDueDate: '2026-11-20', billingDate: '2026-10-24',
};

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 10, 9, 12)); });
afterEach(() => vi.useRealTimers());

describe('UpcomingCardsCard', () => {
  it('shows the October 24 billing for the November 20 payment on November 9', () => {
    render(<UpcomingCardsCard cards={[card]} action={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Paga hasta el 20 nov. · facturó el 24 oct.')).toBeInTheDocument();
    expect(screen.queryByText(/24 nov/)).not.toBeInTheDocument();
    expect(screen.getByText('S/ 250.00')).toBeInTheDocument();
  });

  it('says there is nothing pending when the amount due is zero', () => {
    render(<UpcomingCardsCard cards={[{ ...card, amountDue: 0, billingDate: '2026-11-24', paymentDueDate: '2026-12-20' }]} action={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Sin pagos pendientes · factura el 24 nov.')).toBeInTheDocument();
    expect(screen.queryByText(/Paga hasta/)).not.toBeInTheDocument();
  });

  it.each([
    ['2026-11-08', 'facturó el 08 nov.'],
    ['2026-11-09', 'facturó el 09 nov.'],
    ['2026-11-24', 'factura el 24 nov.'],
  ])('uses the correct tense for billing on %s', (billingDate, text) => {
    render(<UpcomingCardsCard cards={[{ ...card, billingDate, paymentDueDate: '2026-12-20' }]} action={null} onSelect={vi.fn()} />);
    expect(screen.getByText(`Paga hasta el 20 dic. · ${text}`)).toBeInTheDocument();
  });

  it('keeps each line usage inside the block of its own card', () => {
    const second: DashboardCard = { ...card, cardId: 'c2', name: 'Mastercard' };
    const usages = {
      c1: { cardId: 'c1', currency: 'PEN' as const, creditLine: 1000, used: 700, available: 300, creditBalance: 0 },
      c2: { cardId: 'c2', currency: 'PEN' as const, creditLine: 1100, used: 110, available: 990, creditBalance: 0 },
    };
    render(<UpcomingCardsCard cards={[card, second]} usages={usages} action={null} onSelect={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Visa')).toBeInTheDocument();
    expect(within(items[0]).getByRole('progressbar', { name: 'Línea utilizada de Visa' })).toHaveAttribute('aria-valuenow', '70');
    expect(within(items[1]).getByText('S/ 110.00 de S/ 1,100.00')).toBeInTheDocument();
    expect(within(items[1]).getByRole('progressbar', { name: 'Línea utilizada de Mastercard' })).toHaveAttribute('aria-valuenow', '10');
  });

  it('omits the line usage when the server did not provide it', () => {
    render(<UpcomingCardsCard cards={[card]} action={null} onSelect={vi.fn()} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});

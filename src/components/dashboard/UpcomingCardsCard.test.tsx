/**
 * Tests same-cycle billing dates and billing tenses on dashboard cards.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UpcomingCardsCard } from '@/components/dashboard/UpcomingCardsCard';
import type { DashboardCard } from '@/types/overview';

const card: DashboardCard = {
  cardId: 'c1', name: 'Visa', currency: 'PEN', color: '#3333B2', amountDue: 250,
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

  it.each([
    ['2026-11-08', 'facturó el 08 nov.'],
    ['2026-11-09', 'facturó el 09 nov.'],
    ['2026-11-24', 'factura el 24 nov.'],
  ])('uses the correct tense for billing on %s', (billingDate, text) => {
    render(<UpcomingCardsCard cards={[{ ...card, billingDate, paymentDueDate: '2026-12-20' }]} action={null} onSelect={vi.fn()} />);
    expect(screen.getByText(`Paga hasta el 20 dic. · ${text}`)).toBeInTheDocument();
  });
});

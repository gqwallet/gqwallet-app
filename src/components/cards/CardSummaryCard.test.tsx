/**
 * Tests billing tense consistency on card summaries.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CardSummaryCard } from '@/components/cards/CardSummaryCard';
import type { Card, CreditLineUsage, NextBilling } from '@/types/card';

const card: Card = {
  id: 'c1', name: 'Visa', bankName: 'BCP', bankId: null, customBankName: null, currency: 'PEN',
  creditLine: 1000, billingDate: '2026-11-24', billingCutoffTime: null, paymentDueDate: '2026-11-20',
  color: '#3333B2', insurancePercentage: null,
};
const usage: CreditLineUsage = { cardId: 'c1', currency: 'PEN', creditLine: 1000, used: 250, available: 750, creditBalance: 0 };
const billing: NextBilling = {
  cycleStart: '2026-09-25', billingDate: '2026-10-24', paymentDueDate: '2026-11-20', expenses: 250,
  payments: 0, insurancePercentage: null, insuranceCharge: 0, amountDue: 250,
};

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 10, 9, 12)); });
afterEach(() => vi.useRealTimers());

it.each([
  ['2026-10-24', 'facturó el 24 oct.'],
  ['2026-11-09', 'facturó el 09 nov.'],
  ['2026-11-24', 'factura el 24 nov.'],
])('shows the billing date with the correct tense for %s', (billingDate, text) => {
  render(<CardSummaryCard card={card} usage={usage} nextBilling={{ ...billing, billingDate }} onOpen={vi.fn()} onPay={vi.fn()} onEdit={vi.fn()} />);
  expect(screen.getByText(`Total a pagar · ${text}`)).toBeInTheDocument();
  expect(screen.getByText('S/ 250.00')).toBeInTheDocument();
});

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
  color: '#3333B2', insurancePercentage: null, openingDebts: [],
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
  render(<CardSummaryCard card={card} usage={usage} nextBilling={{ ...billing, billingDate }} paymentCycles={[{ cycleStart: billing.cycleStart, closingDate: billingDate, paymentDueDate: billing.paymentDueDate, billed: 250, paid: 0, amountDue: 250, status: 'PENDING' }]} onOpen={vi.fn()} onPay={vi.fn()} onEdit={vi.fn()} />);
  expect(screen.getByText(`Total a pagar · ${text}`)).toBeInTheDocument();
  expect(screen.getByText('S/ 250.00')).toBeInTheDocument();
});

it.each(['OVERDUE', 'PARTIAL'] as const)('offers payment for a previous %s cycle even when the next billing is empty', (status) => {
  const onPay = vi.fn();
  render(<CardSummaryCard card={card} usage={usage} nextBilling={{ ...billing, amountDue: 0 }} paymentCycles={[{ cycleStart: '2026-09-25', closingDate: '2026-10-24', paymentDueDate: '2026-11-01', billed: 100, paid: 40, amountDue: 60, status }]} onOpen={vi.fn()} onPay={onPay} onEdit={vi.fn()} />);
  expect(screen.getByText('Parcial · falta S/ 60.00')).toBeVisible();
  if (status === 'OVERDUE') expect(screen.getByText('Vencida · pagar')).toBeVisible();
  expect(screen.getByRole('button', { name: /Pagar tarjeta/ })).toBeEnabled();
});

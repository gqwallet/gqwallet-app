/**
 * Tests closed-statement totals, mandatory payment states and card summary actions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
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
  ['2026-10-24', 'S/ 250.00'],
  ['2026-11-09', 'S/ 250.00'],
  ['2026-11-24', 'S/ 0.00'],
])('includes only closed statements in the amount due for %s', (billingDate, amount) => {
  render(<CardSummaryCard card={card} usage={usage} nextBilling={{ ...billing, billingDate }} paymentCycles={[{ cycleStart: billing.cycleStart, closingDate: billingDate, paymentDueDate: billing.paymentDueDate, billed: 250, paid: 0, amountDue: 250, status: 'PENDING' }]} onOpen={vi.fn()} onPay={vi.fn()} onEdit={vi.fn()} />);
  expect(screen.getByText('Total a pagar')).toBeInTheDocument();
  expect(screen.getByText(amount)).toBeInTheDocument();
});

it.each(['OVERDUE', 'PARTIAL'] as const)('offers payment for a previous %s cycle even when the next billing is empty', (status) => {
  const onPay = vi.fn();
  render(<CardSummaryCard card={card} usage={usage} nextBilling={{ ...billing, amountDue: 0 }} paymentCycles={[{ cycleStart: '2026-09-25', closingDate: '2026-10-24', paymentDueDate: '2026-11-01', billed: 100, paid: 40, amountDue: 60, status }]} onOpen={vi.fn()} onPay={onPay} onEdit={vi.fn()} />);
  if (status === 'PARTIAL') expect(screen.getByText('Parcial · falta S/ 60.00')).toBeVisible();
  if (status === 'OVERDUE') expect(screen.getByText('Vencida · pagar')).toBeVisible();
  expect(screen.getByRole('button', { name: /Pagar tarjeta/ })).toBeEnabled();
});

it('keeps detail reachable from a settled card and offers the full-width editing action', () => {
  const onOpen = vi.fn();
  render(<CardSummaryCard card={card} usage={usage} nextBilling={billing} paymentCycles={[]} onOpen={onOpen} onPay={vi.fn()} onEdit={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Ver detalle' }));
  expect(onOpen).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Editar tarjeta' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Pagar tarjeta' })).not.toBeInTheDocument();
});

/**
 * Tests that due groups keep the backend numbering for previously paid installments.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DueGroups } from '@/components/obligations/DueGroups';
import type { FixedPaymentKind, PaymentDue } from '@/types/obligation';

const due: PaymentDue = {
  id: 'd1', fixedPaymentId: 'f1', description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE',
  dueDate: '2026-10-28', expectedAmount: 250, paidAmount: null, currency: 'PEN', installment: '14/24',
  usualPaymentMethodKind: null, usualInstrumentId: null, status: 'PENDING',
};

it.each([false, true])('shows the supplied installment label with compact mode %s', (isCompact) => {
  render(<DueGroups dues={{ overdue: [], today: [due], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] }} today="2026-10-28" isCompact={isCompact} />);
  expect(screen.getByText(/cuota 14\/24/)).toBeInTheDocument();
});

const chargeKinds: FixedPaymentKind[] = ['HOUSEHOLD_SERVICES', 'SUBSCRIPTIONS', 'MEMBERSHIPS'];

it.each(chargeKinds)('describes an overdue %s as a pending charge in full and compact rows', (kind) => {
  const dues = { overdue: [{ ...due, kind, installment: null }], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] };
  const { rerender } = render(<DueGroups dues={dues} today="2026-11-09" />);
  expect(screen.getByText(/se cobra el 28 oct/)).toBeInTheDocument();
  expect(screen.queryByText(/vencía/)).not.toBeInTheDocument();
  expect(screen.getAllByText('Cobro pendiente')).toHaveLength(2);
  expect(screen.getByText('Vencidos')).toBeInTheDocument();
  rerender(<DueGroups dues={dues} today="2026-11-09" isCompact />);
  expect(screen.getByText(/se cobra el 28 oct/)).toBeInTheDocument();
});

it('preserves overdue wording for installment payments', () => {
  render(<DueGroups dues={{ overdue: [due], today: [], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] }} today="2026-11-09" />);
  expect(screen.getByText(/vencía 28 oct/)).toBeInTheDocument();
  expect(screen.getAllByText('Vencido')).toHaveLength(2);
});

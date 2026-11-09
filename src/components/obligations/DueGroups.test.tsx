/**
 * Tests that due groups keep the backend numbering for previously paid installments.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DueGroups } from '@/components/obligations/DueGroups';
import type { PaymentDue } from '@/types/obligation';

const due: PaymentDue = {
  id: 'd1', fixedPaymentId: 'f1', description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE',
  dueDate: '2026-10-28', expectedAmount: 250, paidAmount: null, currency: 'PEN', installment: '14/24',
  usualPaymentMethodKind: null, usualInstrumentId: null, status: 'PENDING',
};

it.each([false, true])('shows the supplied installment label with compact mode %s', (isCompact) => {
  render(<DueGroups dues={{ overdue: [], today: [due], tomorrow: [], inTwoToThreeDays: [], laterThisMonth: [] }} today="2026-10-28" isCompact={isCompact} />);
  expect(screen.getByText(/cuota 14\/24/)).toBeInTheDocument();
});

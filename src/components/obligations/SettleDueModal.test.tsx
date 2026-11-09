/**
 * Tests charge and due wording in payment confirmation and validation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { SettleDueModal } from '@/components/obligations/SettleDueModal';
import type { FixedPaymentKind, PaymentDue } from '@/types/obligation';

const due: PaymentDue = {
  id: 'd1', fixedPaymentId: 'f1', description: 'Internet', kind: 'HOUSEHOLD_SERVICES',
  dueDate: '2026-11-20', expectedAmount: 99, paidAmount: null, currency: 'PEN', installment: null,
  usualPaymentMethodKind: 'ACCOUNT', usualInstrumentId: 'a1', status: 'PENDING',
};
const cases: [FixedPaymentKind, string, string][] = [
  ['HOUSEHOLD_SERVICES', 'Se cobra el', 'cobro'],
  ['SUBSCRIPTIONS', 'Se cobra el', 'cobro'],
  ['MEMBERSHIPS', 'Se cobra el', 'cobro'],
  ['DEBT', 'Vencimiento del', 'vencimiento'],
  ['RENT', 'Vencimiento del', 'vencimiento'],
  ['INSTALLMENT_PURCHASE', 'Vencimiento del', 'vencimiento'],
];

it.each(cases)('uses consistent confirmation and validation wording for %s', (kind, label, noun) => {
  const onConfirm = vi.fn();
  render(<SettleDueModal due={{ ...due, kind }} today="2026-11-09" means={[{ kind: 'ACCOUNT', id: 'a1', name: 'Débito' }]} categoryName="Servicios" isSaving={false} error={null} onConfirm={onConfirm} onClose={vi.fn()} />);
  expect(screen.getByText(new RegExp(`${label} 20 nov`))).toBeInTheDocument();
  expect(screen.getByText(new RegExp(`el ${noun} pasa a «Pagado»`))).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Pagué otro monto' }));
  expect(screen.getByText(new RegExp(`solo en este ${noun}`))).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Monto pagado (opcional)'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar pago' }));
  expect(screen.getByText(`Ingresa un monto mayor a cero. El ${noun} sigue pendiente.`)).toBeInTheDocument();
  expect(onConfirm).not.toHaveBeenCalled();
});

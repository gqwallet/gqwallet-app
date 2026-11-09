/**
 * Tests charge and due wording in payment confirmation and validation.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { SettleDueModal, type SettleDueModalProps } from '@/components/obligations/SettleDueModal';
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
  render(<SettleDueModal due={{ ...due, kind }} today="2026-11-09" means={[{ kind: 'ACCOUNT', id: 'a1', name: 'Débito' }]} categoryName="Servicios" isSaving={false} error={null} onConfirm={onConfirm} isSkipping={false} skipError={null} onSkip={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByText(new RegExp(`${label} 20 nov`))).toBeInTheDocument();
  expect(screen.getByText(new RegExp(`el ${noun} pasa a «Pagado»`))).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Pagué otro monto' }));
  expect(screen.getByText(new RegExp(`solo en este ${noun}`))).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Monto pagado (opcional)'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar pago' }));
  expect(screen.getByText(`Ingresa un monto mayor a cero. El ${noun} sigue pendiente.`)).toBeInTheDocument();
  expect(onConfirm).not.toHaveBeenCalled();
});

function props(overrides: Partial<SettleDueModalProps> = {}): SettleDueModalProps {
  return {
    due, today: '2026-10-09', means: [], categoryName: null, isSaving: false, error: null,
    onConfirm: vi.fn(), isSkipping: false, skipError: null, onSkip: vi.fn(), onClose: vi.fn(), ...overrides,
  };
}

it('requires confirmation before skipping, even without a payment method', () => {
  const options = props();
  render(<SettleDueModal {...options} />);
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  expect(screen.getByRole('dialog', { name: '¿Omitir el vencimiento de noviembre 2026?' })).toBeInTheDocument();
  expect(screen.getByText('No se registra ningún gasto y el vencimiento sale de tus pendientes. Internet sigue activo los próximos meses.')).toBeInTheDocument();
  expect(options.onSkip).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  expect(options.onSkip).toHaveBeenCalledTimes(1);
  expect(options.onConfirm).not.toHaveBeenCalled();
});

it.each(['Cancelar', 'Cerrar'])('returns to the payment dialog on %s without skipping', (button) => {
  const options = props();
  render(<SettleDueModal {...options} />);
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  fireEvent.click(screen.getByRole('button', { name: button }));
  expect(screen.getByRole('dialog', { name: 'Confirmar pago de Internet' })).toBeInTheDocument();
  expect(options.onSkip).not.toHaveBeenCalled();
  expect(options.onClose).not.toHaveBeenCalled();
});

it('keeps skip errors in the confirmation and allows retrying', () => {
  const options = props({ error: 'Error al pagar' });
  const { rerender } = render(<SettleDueModal {...options} />);
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  rerender(<SettleDueModal {...options} skipError="No pudimos omitir el vencimiento. Inténtalo de nuevo." />);
  expect(screen.getByRole('alert')).toHaveTextContent('No pudimos omitir el vencimiento. Inténtalo de nuevo.');
  expect(screen.queryByText('Error al pagar')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  expect(options.onSkip).toHaveBeenCalledTimes(1);
});

it('blocks confirming or dismissing while the skip is saving', () => {
  const options = props();
  const { rerender } = render(<SettleDueModal {...options} />);
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  rerender(<SettleDueModal {...options} isSkipping />);
  expect(screen.getByRole('button', { name: 'Omitir este mes' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('dialog', { name: /¿Omitir el vencimiento/ })).toBeInTheDocument();
  expect(options.onSkip).not.toHaveBeenCalled();
  expect(options.onClose).not.toHaveBeenCalled();
});

it('resets the confirmation after closing and reopening or choosing another due', () => {
  const options = props();
  const { rerender } = render(<SettleDueModal {...options} />);
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  rerender(<SettleDueModal {...options} due={null} />);
  rerender(<SettleDueModal {...options} />);
  expect(screen.getByRole('dialog', { name: 'Confirmar pago de Internet' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Omitir este mes' }));
  rerender(<SettleDueModal {...options} due={{ ...due, id: 'd2', description: 'Agua' }} />);
  expect(screen.getByRole('dialog', { name: 'Confirmar pago de Agua' })).toBeInTheDocument();
});

it.each(['PAID', 'VOIDED'] as const)('does not offer skipping for a %s due', (status) => {
  render(<SettleDueModal {...props({ due: { ...due, status } })} />);
  expect(screen.queryByRole('button', { name: 'Omitir este mes' })).not.toBeInTheDocument();
});

it('blocks opening the skip confirmation while a payment is saving', () => {
  render(<SettleDueModal {...props({ isSaving: true })} />);
  expect(screen.getByRole('button', { name: 'Omitir este mes' })).toBeDisabled();
});

/**
 * Tests cycle selection, suggested amounts and partial payment submission.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { PayCardModal } from '@/components/cards/PayCardModal';
import type { PaymentCycle } from '@/types/card';

const cycles: PaymentCycle[] = [
  { cycleStart: '2026-11-02', closingDate: '2026-12-01', paymentDueDate: '2026-12-02', billed: 80, paid: 0, amountDue: 80, status: 'OPEN' },
  { cycleStart: '2026-09-02', closingDate: '2026-10-01', paymentDueDate: '2026-10-02', billed: 100, paid: 40, amountDue: 60, status: 'OVERDUE' },
  { cycleStart: '2026-08-02', closingDate: '2026-09-01', paymentDueDate: '2026-09-02', billed: 50, paid: 50, amountDue: 0, status: 'PAID' },
];
const accounts = [{ id: 'a1', alias: 'Cuenta', currency: 'PEN' as const, balance: 500 }];

it('defaults to the oldest unpaid cycle and submits a partial payment for that exact cycle', () => {
  const onSubmit = vi.fn();
  render(<PayCardModal isOpen cardName="Visa" currency="PEN" cycles={cycles} accounts={accounts} isSaving={false} error={null} onSubmit={onSubmit} onClose={vi.fn()} />);
  expect(screen.getByLabelText('Facturación')).toHaveValue('2026-10-01');
  expect(screen.getByLabelText('Importe')).toHaveValue('60.00');
  expect(screen.getByText('Puedes pagar una parte; el saldo queda pendiente')).toBeVisible();
  expect(screen.getByLabelText('Facturación').querySelectorAll('option')).toHaveLength(2);
  fireEvent.change(screen.getByLabelText('Importe'), { target: { value: '20' } });
  fireEvent.click(screen.getByRole('button', { name: 'Registrar pago' }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ sourceAccountId: 'a1', amount: 20, cycleClosingDate: '2026-10-01' }));
  fireEvent.change(screen.getByLabelText('Facturación'), { target: { value: '2026-12-01' } });
  expect(screen.getByLabelText('Importe')).toHaveValue('80.00');
  fireEvent.click(screen.getByRole('button', { name: 'Registrar pago' }));
  expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ amount: 80, cycleClosingDate: '2026-12-01' }));
});

it('honors a cycle chosen from the pending list and resets it when reopened', () => {
  const props = { cardName: 'Visa', currency: 'PEN' as const, cycles, accounts, isSaving: false, error: null, onSubmit: vi.fn(), onClose: vi.fn() };
  const { rerender } = render(<PayCardModal {...props} isOpen={false} />);
  rerender(<PayCardModal {...props} isOpen initialClosingDate="2026-12-01" />);
  expect(screen.getByLabelText('Facturación')).toHaveValue('2026-12-01');
  expect(screen.getByLabelText('Importe')).toHaveValue('80.00');
  rerender(<PayCardModal {...props} isOpen={false} />);
  rerender(<PayCardModal {...props} isOpen />);
  expect(screen.getByLabelText('Facturación')).toHaveValue('2026-10-01');
  expect(screen.getByLabelText('Importe')).toHaveValue('60.00');
});

it('prevents payment without an unpaid cycle or a source account', () => {
  const props = { isOpen: true, cardName: 'Visa', currency: 'PEN' as const, cycles: [], accounts, isSaving: false, error: null, onSubmit: vi.fn(), onClose: vi.fn() };
  const { rerender } = render(<PayCardModal {...props} />);
  expect(screen.getByRole('button', { name: 'Registrar pago' })).toBeDisabled();
  rerender(<PayCardModal {...props} cycles={cycles} accounts={[]} />);
  expect(screen.getByRole('button', { name: 'Registrar pago' })).toBeDisabled();
});

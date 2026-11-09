/**
 * Tests outstanding cycle history, server states and payment callbacks.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { PendingCyclesList } from '@/components/cards/PendingCyclesList';
import type { PaymentCycle } from '@/types/card';

it('preserves billed, paid and due values and includes closed and overdue cycles', () => {
  const cycles: PaymentCycle[] = [
    { cycleStart: '2026-10-02', closingDate: '2026-11-01', paymentDueDate: '2026-11-20', billed: 90, paid: 30, amountDue: 60, status: 'PARTIAL' },
    { cycleStart: '2026-09-02', closingDate: '2026-10-01', paymentDueDate: '2026-10-20', billed: 120, paid: 40, amountDue: 82, status: 'OVERDUE' },
    { cycleStart: '2026-08-02', closingDate: '2026-09-01', paymentDueDate: '2026-09-20', billed: 50, paid: 50, amountDue: 0, status: 'PAID' },
  ];
  const onPay = vi.fn();
  render(<PendingCyclesList cycles={cycles} currency="PEN" onPay={onPay} />);
  expect(screen.getByText('Vencida')).toBeVisible();
  expect(screen.getByText('Parcial')).toBeVisible();
  expect(screen.getByText('Pagado S/ 40.00 de S/ 120.00')).toBeVisible();
  expect(screen.getByText('S/ 82.00')).toBeVisible();
  expect(screen.getAllByRole('button', { name: 'Pagar' })).toHaveLength(2);
  fireEvent.click(screen.getAllByRole('button', { name: 'Pagar' })[0]);
  expect(onPay).toHaveBeenCalledWith('2026-10-01');
});

it('shows an empty state once all statements are settled', () => {
  render(<PendingCyclesList cycles={[]} currency="USD" onPay={vi.fn()} />);
  expect(screen.getByText('Sin pagos pendientes')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Pagar' })).not.toBeInTheDocument();
});

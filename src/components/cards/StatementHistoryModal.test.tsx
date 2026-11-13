/**
 * Tests visibility of settled statements and their immutable server amounts.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { StatementHistoryModal } from '@/components/cards/StatementHistoryModal';

it('retains fully paid statements with their original billed and paid amounts', () => {
  const onClose = vi.fn();
  render(<StatementHistoryModal isOpen currency="PEN" onClose={onClose} cycles={[
    { cycleStart: '2026-09-01', closingDate: '2026-09-30', paymentDueDate: '2026-10-20', billed: 100, paid: 100, amountDue: 0, status: 'PAID' },
    { cycleStart: '2026-10-01', closingDate: '2026-10-31', paymentDueDate: '2026-11-20', billed: 80, paid: 20, amountDue: 60, status: 'PARTIAL' },
  ]} />);
  const paid = screen.getByRole('row', { name: /Pagada/ });
  expect(within(paid).getAllByText('S/ 100.00')).toHaveLength(2);
  expect(within(paid).getByText('S/ 0.00')).toBeVisible();
  expect(screen.getByRole('row', { name: /Parcial/ })).toHaveTextContent('S/ 60.00');
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar historial' }));
  expect(onClose).toHaveBeenCalledOnce();
});

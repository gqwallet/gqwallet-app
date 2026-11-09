/**
 * Tests conditional purchase-time selection and transient form payloads.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TransactionForm, type TransactionFormProps } from '@/components/transactions/TransactionForm';
import type { Card } from '@/types/card';

const card: Card = {
  id: 'c1', name: 'Visa', bankName: 'BCP', bankId: null, customBankName: 'BCP', currency: 'PEN',
  creditLine: 1000, billingDate: '2026-11-08', billingCutoffTime: '22:00', paymentDueDate: '2026-11-28',
  color: '#3333B2', insurancePercentage: null,
};

function props(): TransactionFormProps {
  return {
    id: 'expense', nature: 'EXPENSE', categories: [{ id: 'k1', name: 'Supermercado', nature: 'EXPENSE', status: 'ACTIVE' }],
    accounts: [], cards: [card], defaultCurrency: 'PEN', today: '2026-11-08',
    onSubmit: vi.fn(), onSuggestMerchants: vi.fn().mockResolvedValue([]), onManageCategories: vi.fn(),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-09T03:08:59Z'));
});
afterEach(() => vi.useRealTimers());

describe('TransactionForm purchase time', () => {
  it('prefills today with Lima time rounded down and passes the selected time', () => {
    const input = props();
    render(<TransactionForm {...input} />);
    expect(screen.getByRole('group', { name: 'Hora del consumo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Hora del consumo')).toHaveValue('22');
    expect(screen.getByLabelText('Minutos')).toHaveValue('05');
    expect(screen.getByText('Opcional. Después de las 22:00 pasa al ciclo siguiente.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Hora del consumo'), { target: { value: '21' } });
    fireEvent.change(screen.getByLabelText('Minutos'), { target: { value: '00' } });
    fireEvent.change(screen.getByLabelText('Importe'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Elige una categoría/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Supermercado' }));
    fireEvent.submit(screen.getByLabelText('Importe').closest('form') as HTMLFormElement);
    expect(input.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ purchaseTime: '21:00', economicDate: '2026-11-08', instrumentId: 'c1' }));
  });

  it('starts empty on a different billing date and resets when the date or instrument changes', () => {
    render(<TransactionForm {...props()} />);
    fireEvent.change(screen.getByLabelText('Fecha económica'), { target: { value: '2026-12-08' } });
    expect(screen.getByLabelText('Hora del consumo')).toHaveValue('');
    expect(screen.getByLabelText('Minutos')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Hora del consumo'), { target: { value: '23' } });
    fireEvent.change(screen.getByLabelText('Fecha económica'), { target: { value: '2026-12-09' } });
    expect(screen.queryByRole('group', { name: 'Hora del consumo' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Fecha económica'), { target: { value: '2026-12-08' } });
    expect(screen.getByLabelText('Hora del consumo')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Medio de pago'), { target: { value: 'NONE' } });
    expect(screen.queryByRole('group', { name: 'Hora del consumo' })).not.toBeInTheDocument();
  });

  it('hides the time without a cut-off or for incomes', () => {
    const input = props();
    const { rerender } = render(<TransactionForm {...input} cards={[{ ...card, billingCutoffTime: null }]} />);
    expect(screen.queryByRole('group', { name: 'Hora del consumo' })).not.toBeInTheDocument();
    rerender(<TransactionForm {...input} nature="INCOME" />);
    expect(screen.queryByRole('group', { name: 'Hora del consumo' })).not.toBeInTheDocument();
  });
});

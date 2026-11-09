/**
 * Tests catalog bank selection, custom bank validation and existing card bank references.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CardForm } from '@/components/cards/CardForm';
import type { Card } from '@/types/card';
import type { Bank } from '@/types/catalog';

const banks: Bank[] = [{ id: 'bcp-id', name: 'BCP', countryCode: 'PE', active: true }];
const initial: Card = {
  id: 'card-id', name: 'Visa', bankId: 'retired-id', bankName: 'Banco anterior', customBankName: null,
  currency: 'PEN', creditLine: 1000, billingDate: '2026-06-10', paymentDueDate: '2026-06-28', color: '#3333B2', insurancePercentage: null,
};

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Visa' } });
  fireEvent.change(screen.getByLabelText('Línea de crédito'), { target: { value: '1000' } });
}

function submit() {
  fireEvent.submit(screen.getByLabelText('Nombre').closest('form') as HTMLFormElement);
}

describe('CardForm', () => {
  it('places a payment day before the billing day in the following month', () => {
    const onSubmit = vi.fn();
    render(<CardForm id="card" banks={banks} defaultCurrency="PEN" today="2026-11-08" onSubmit={onSubmit} />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'bcp-id' } });
    fireEvent.change(screen.getByLabelText('Día de facturación'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Día de pago'), { target: { value: '5' } });
    expect(screen.getByText('Se paga en el mes siguiente al corte.')).toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ billingDate: '2026-11-10', paymentDueDate: '2026-12-05' }));
  });

  it('rejects a payment day equal to the billing day', () => {
    const onSubmit = vi.fn();
    render(<CardForm id="card" banks={banks} defaultCurrency="PEN" today="2026-11-08" onSubmit={onSubmit} />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'bcp-id' } });
    fireEvent.change(screen.getByLabelText('Día de facturación'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Día de pago'), { target: { value: '10' } });
    submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('El día de pago no puede ser el mismo día de facturación.')).toBeInTheDocument();
  });

  it('renders only the supplied country catalog plus the custom bank option', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(<CardForm id="card" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    expect(within(screen.getByLabelText('Banco')).getByRole('option', { name: 'BCP' })).toHaveValue('bcp-id');
    rerender(<CardForm id="card" banks={[{ id: 'chile-id', name: 'Banco de Chile', countryCode: 'CL', active: true }]} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    expect(within(screen.getByLabelText('Banco')).queryByRole('option', { name: 'BCP' })).not.toBeInTheDocument();
    expect(within(screen.getByLabelText('Banco')).getByRole('option', { name: 'Banco de Chile' })).toHaveValue('chile-id');
    expect(within(screen.getByLabelText('Banco')).getByRole('option', { name: 'Otro banco' })).toBeInTheDocument();
  });

  it('requires a bank and emits a catalog id without a custom name', () => {
    const onSubmit = vi.fn();
    render(<CardForm id="card" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    fillRequiredFields();
    submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Banco')).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'bcp-id' } });
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Visa', bankId: 'bcp-id', customBankName: null, creditLine: 1000, currency: 'PEN' }));
  });

  it('reveals the custom name and rejects blank or more than 150 characters', () => {
    const onSubmit = vi.fn();
    render(<CardForm id="card" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    fillRequiredFields();
    expect(screen.queryByLabelText('Nombre del banco')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'OTHER' } });
    const field = screen.getByLabelText('Nombre del banco');
    expect(field).toHaveAttribute('maxlength', '150');
    for (const value of ['   ', 'B'.repeat(151)]) {
      fireEvent.change(field, { target: { value } });
      submit();
      expect(field).toHaveAttribute('aria-invalid', 'true');
    }
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(field, { target: { value: 'B'.repeat(150) } });
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ bankId: null, customBankName: 'B'.repeat(150) }));
  });

  it('trims custom names and clears the custom payload when switching to a catalog bank', () => {
    const onSubmit = vi.fn();
    render(<CardForm id="card" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'OTHER' } });
    fireEvent.change(screen.getByLabelText('Nombre del banco'), { target: { value: '  Cooperativa local  ' } });
    submit();
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ bankId: null, customBankName: 'Cooperativa local' }));
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'bcp-id' } });
    expect(screen.queryByLabelText('Nombre del banco')).not.toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ bankId: 'bcp-id', customBankName: null }));
  });

  it('keeps an existing catalog bank visible even if it was deactivated', () => {
    const onSubmit = vi.fn();
    render(<CardForm id="card" banks={banks} initial={initial} defaultCurrency="USD" today="2026-06-03" onSubmit={onSubmit} />);
    expect(screen.getByLabelText('Banco')).toHaveValue('retired-id');
    expect(within(screen.getByLabelText('Banco')).getByRole('option', { name: 'Banco anterior' })).toHaveValue('retired-id');
    expect(screen.getByLabelText('Moneda de la línea')).toBeDisabled();
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ bankId: 'retired-id', customBankName: null, currency: 'PEN', creditLine: 1000 }));
  });

  it('initializes the custom bank option when editing a card outside the catalog', () => {
    const onSubmit = vi.fn();
    render(<CardForm id="card" banks={banks} initial={{ ...initial, bankId: null, customBankName: 'Cooperativa local', bankName: 'Cooperativa local' }} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    expect(screen.getByLabelText('Banco')).toHaveValue('OTHER');
    expect(screen.getByLabelText('Nombre del banco')).toHaveValue('Cooperativa local');
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ bankId: null, customBankName: 'Cooperativa local' }));
  });
});

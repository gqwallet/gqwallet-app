/**
 * Tests catalog bank selection, custom bank validation and cash account behavior.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountForm } from '@/components/accounts/AccountForm';
import type { Account } from '@/types/account';
import type { Bank } from '@/types/catalog';

const banks: Bank[] = [{ id: 'bcp-id', name: 'BCP', countryCode: 'PE', active: true }];
const initial: Account = {
  id: 'account-id', alias: 'Mi cuenta', bankId: 'retired-id', bankName: 'Banco anterior', customBankName: null,
  type: 'DEBIT', currency: 'PEN', openingBalance: 25, openingBalanceAsOf: '2026-06-01', status: 'ACTIVE',
};

function submit() {
  fireEvent.submit(screen.getByLabelText('Alias').closest('form') as HTMLFormElement);
}

describe('AccountForm', () => {
  it('uses the country catalog passed in props and replaces its choices when the catalog changes', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(<AccountForm id="account" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    expect(within(screen.getByLabelText('Banco')).getByRole('option', { name: 'BCP' })).toHaveValue('bcp-id');
    expect(screen.queryByLabelText('Nombre del banco')).not.toBeInTheDocument();
    rerender(<AccountForm id="account" banks={[{ id: 'chile-id', name: 'Banco de Chile', countryCode: 'CL', active: true }]} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    expect(within(screen.getByLabelText('Banco')).queryByRole('option', { name: 'BCP' })).not.toBeInTheDocument();
    expect(within(screen.getByLabelText('Banco')).getByRole('option', { name: 'Banco de Chile' })).toHaveValue('chile-id');
    expect(within(screen.getByLabelText('Banco')).getByRole('option', { name: 'Otro banco' })).toBeInTheDocument();
  });

  it('requires a bank for non-cash accounts and emits the selected catalog id', () => {
    const onSubmit = vi.fn();
    render(<AccountForm id="account" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Alias'), { target: { value: '  Ahorros  ' } });
    submit();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Banco')).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'bcp-id' } });
    submit();
    expect(onSubmit).toHaveBeenCalledWith({ alias: 'Ahorros', type: 'DEBIT', bankId: 'bcp-id', customBankName: null, currency: 'PEN', openingBalance: 0, openingBalanceAsOf: '2026-06-03' });
  });

  it('reveals the custom bank field, rejects blank and excessive names, and accepts 150 characters', () => {
    const onSubmit = vi.fn();
    render(<AccountForm id="account" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Alias'), { target: { value: 'Ahorros' } });
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

  it('submits a trimmed custom name and clears it from the payload when selecting a catalog bank', () => {
    const onSubmit = vi.fn();
    render(<AccountForm id="account" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Alias'), { target: { value: 'Ahorros' } });
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'OTHER' } });
    fireEvent.change(screen.getByLabelText('Nombre del banco'), { target: { value: '  Cooperativa local  ' } });
    submit();
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ bankId: null, customBankName: 'Cooperativa local' }));
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'bcp-id' } });
    expect(screen.queryByLabelText('Nombre del banco')).not.toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({ bankId: 'bcp-id', customBankName: null }));
  });

  it('hides both bank fields for cash and submits null bank references', () => {
    const onSubmit = vi.fn();
    render(<AccountForm id="account" banks={banks} defaultCurrency="PEN" today="2026-06-03" onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Alias'), { target: { value: 'Billetera' } });
    fireEvent.change(screen.getByLabelText('Banco'), { target: { value: 'OTHER' } });
    fireEvent.change(screen.getByLabelText('Nombre del banco'), { target: { value: 'Banco previo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Efectivo' }));
    expect(screen.queryByLabelText('Banco')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre del banco')).not.toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'CASH', bankId: null, customBankName: null }));
  });

  it('preserves an existing bank absent from the active catalog when editing', () => {
    const onSubmit = vi.fn();
    render(<AccountForm id="account" banks={banks} initial={initial} defaultCurrency="USD" today="2026-06-03" onSubmit={onSubmit} />);
    expect(screen.getByLabelText('Banco')).toHaveValue('retired-id');
    expect(within(screen.getByLabelText('Banco')).getByRole('option', { name: 'Banco anterior' })).toHaveValue('retired-id');
    expect(screen.getByLabelText('Tipo de cuenta')).toBeDisabled();
    expect(screen.getByLabelText('Moneda')).toBeDisabled();
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ bankId: 'retired-id', customBankName: null, currency: 'PEN', openingBalance: 25 }));
  });
});

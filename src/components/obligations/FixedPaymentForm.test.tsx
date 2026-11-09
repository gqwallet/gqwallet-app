/**
 * Tests previously paid installments, validation, payloads and the schedule preview.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FixedPaymentForm } from '@/components/obligations/FixedPaymentForm';
import type { FixedPayment } from '@/types/obligation';

const initial: FixedPayment = {
  id: 'f1', description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE', budgetCategoryId: 'c1',
  amount: 250, currency: 'PEN', dueDay: 28, startMonth: '2026-10', totalInstallments: 24,
  paidInstallments: 13, status: 'ACTIVE',
};

function setup(payment?: FixedPayment) {
  const onSubmit = vi.fn();
  render(<FixedPaymentForm id="fixed-payment" initial={payment} categories={[{ value: 'c1', label: 'Otros gastos' }]} means={[]} defaultCurrency="PEN" today="2026-10-15" onSubmit={onSubmit} />);
  if (!payment) {
    fireEvent.change(screen.getByLabelText('Categoría fija'), { target: { value: 'INSTALLMENT_PURCHASE' } });
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'iPhone 16 Pro' } });
    fireEvent.change(screen.getByLabelText('Categoría de gasto para el presupuesto'), { target: { value: 'c1' } });
    fireEvent.change(screen.getByLabelText('Monto mensual'), { target: { value: '250' } });
  }
  return onSubmit;
}

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function submit() {
  fireEvent.submit(screen.getByLabelText('Descripción').closest('form') as HTMLFormElement);
}

describe('FixedPaymentForm', () => {
  it.each(['DEBT', 'INSTALLMENT_PURCHASE'])('allows installments for %s', (kind) => {
    const onSubmit = setup();
    change('Categoría fija', kind);
    change('Número total de cuotas', '24');
    change('Cuotas ya pagadas', '13');
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ kind, totalInstallments: 24, paidInstallments: 13 }));
  });

  it.each(['HOUSEHOLD_SERVICES', 'SUBSCRIPTIONS', 'MEMBERSHIPS', 'RENT'])('ignores previous installment values when changing to %s', (kind) => {
    const onSubmit = setup();
    change('Número total de cuotas', '0');
    submit();
    change('Número total de cuotas', '24');
    change('Cuotas ya pagadas', '-1');
    submit();
    change('Categoría fija', kind);
    expect(screen.queryByLabelText('Número total de cuotas')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cuotas ya pagadas')).not.toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ kind, totalInstallments: null, paidInstallments: null }));
  });

  it.each(['HOUSEHOLD_SERVICES', 'SUBSCRIPTIONS', 'MEMBERSHIPS'])('uses charge wording and day validation for %s', (kind) => {
    const onSubmit = setup();
    change('Categoría fija', kind);
    expect(screen.getByLabelText('Día de cobro')).toBeInTheDocument();
    expect(screen.getByText('El día del mes en que te cobran. Si el mes tiene menos días, se cobra el último día.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Día de vencimiento')).not.toBeInTheDocument();
    change('Día de cobro', '32');
    submit();
    expect(screen.getByText('Elige un día entre 1 y 31.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(['DEBT', 'RENT', 'INSTALLMENT_PURCHASE'])('preserves due wording for %s', (kind) => {
    setup();
    change('Categoría fija', kind);
    expect(screen.getByLabelText('Día de vencimiento')).toBeInTheDocument();
    expect(screen.getByText('Si el mes tiene menos días, vence el último día del mes.')).toBeInTheDocument();
  });

  it('starts with a charge day and no installment fields', () => {
    render(<FixedPaymentForm id="fp" categories={[]} means={[]} defaultCurrency="PEN" today="2026-11-09" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Día de cobro')).toBeInTheDocument();
    expect(screen.queryByLabelText('Número total de cuotas')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cuotas ya pagadas')).not.toBeInTheDocument();
  });

  it('discards legacy installments when editing a charge kind', () => {
    const onSubmit = setup({ ...initial, kind: 'SUBSCRIPTIONS' });
    expect(screen.getByLabelText('Día de cobro')).toBeInTheDocument();
    expect(screen.queryByLabelText('Número total de cuotas')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cuotas ya pagadas')).not.toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ totalInstallments: null, paidInstallments: null }));
  });

  it('shows the numeric paid field only when total installments has a value', () => {
    setup();
    expect(screen.queryByLabelText('Cuotas ya pagadas')).not.toBeInTheDocument();
    change('Número total de cuotas', '24');
    expect(screen.getByLabelText('Cuotas ya pagadas')).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByText('Opcional. Las que pagaste antes de usar GQWallet: no se registran como gastos.')).toBeInTheDocument();
    change('Número total de cuotas', '');
    expect(screen.queryByLabelText('Cuotas ya pagadas')).not.toBeInTheDocument();
  });

  it.each(['-1', '1.5', 'abc'])('rejects an invalid paid count: %s', (paid) => {
    const onSubmit = setup();
    change('Número total de cuotas', '24');
    change('Cuotas ya pagadas', paid);
    submit();
    expect(screen.getByText('Ingresa un número entero desde 0.')).toBeInTheDocument();
    expect(screen.getByLabelText('Cuotas ya pagadas')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText(/Próxima: cuota/)).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(['24', '25'])('rejects a paid count at or above the total: %s', (paid) => {
    const onSubmit = setup();
    change('Número total de cuotas', '24');
    change('Cuotas ya pagadas', paid);
    submit();
    expect(screen.getByText('Deben ser menos que el número total de cuotas.')).toBeInTheDocument();
    expect(screen.queryByText(/Próxima: cuota/)).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the paid count and previews the remaining schedule', () => {
    const onSubmit = setup();
    change('Categoría fija', 'INSTALLMENT_PURCHASE');
    change('Número total de cuotas', '24');
    change('Cuotas ya pagadas', '13');
    expect(screen.getByText('Opcional. Numeramos de 14/24 a 24/24 y lo finalizamos tras la última.')).toBeInTheDocument();
    expect(screen.getByText('Próxima: cuota 14 de 24 · termina en agosto 2027')).toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenCalledWith({
      description: 'iPhone 16 Pro', kind: 'INSTALLMENT_PURCHASE', budgetCategoryId: 'c1', amount: 250,
      currency: 'PEN', dueDay: 1, startMonth: '2026-10', totalInstallments: 24, paidInstallments: 13,
      usualPaymentMethodKind: null, usualInstrumentId: null,
    });
  });

  it.each(['', '0'])('submits zero for a blank or zero paid count (%s)', (paid) => {
    const onSubmit = setup();
    change('Número total de cuotas', '24');
    change('Cuotas ya pagadas', paid);
    expect(screen.getByText('Opcional. Numeramos de 1/24 a 24/24 y lo finalizamos tras la última.')).toBeInTheDocument();
    expect(screen.getByText('Próxima: cuota 1 de 24 · termina en setiembre 2028')).toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ totalInstallments: 24, paidInstallments: 0 }));
  });

  it('submits null counts and ignores hidden paid values after clearing the total', () => {
    const onSubmit = setup();
    change('Número total de cuotas', '24');
    change('Cuotas ya pagadas', '-1');
    submit();
    change('Número total de cuotas', '');
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ totalInstallments: null, paidInstallments: null }));
    expect(screen.queryByText(/Próxima: cuota/)).not.toBeInTheDocument();
  });

  it.each(['0', '-1', '2.5', 'abc'])('hides the preview and rejects an invalid total: %s', (total) => {
    const onSubmit = setup();
    change('Número total de cuotas', total);
    submit();
    expect(screen.getByText('Si indicas cuotas, deben ser mayores a cero.')).toBeInTheDocument();
    expect(screen.queryByText(/Próxima: cuota/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cuotas ya pagadas')).not.toBeInTheDocument();
    expect(screen.queryByText(/Numeramos de/)).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('updates the preview when the total or paid count changes', () => {
    setup();
    change('Número total de cuotas', '24');
    change('Cuotas ya pagadas', '23');
    expect(screen.getByText('Próxima: cuota 24 de 24 · termina en octubre 2026')).toBeInTheDocument();
    change('Número total de cuotas', '25');
    expect(screen.getByText('Próxima: cuota 24 de 25 · termina en noviembre 2026')).toBeInTheDocument();
  });

  it('shows saved total and paid counts disabled when editing and preserves the payload', () => {
    const onSubmit = setup(initial);
    expect(screen.getByLabelText('Número total de cuotas')).toBeDisabled();
    expect(screen.getByLabelText('Número total de cuotas')).toHaveValue('24');
    expect(screen.getByLabelText('Cuotas ya pagadas')).toBeDisabled();
    expect(screen.getByLabelText('Cuotas ya pagadas')).toHaveValue('13');
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ totalInstallments: 24, paidInstallments: 13 }));
  });

  it('shows zero previously paid installments when editing an unoffset schedule', () => {
    setup({ ...initial, paidInstallments: 0 });
    expect(screen.getByLabelText('Cuotas ya pagadas')).toHaveValue('0');
    expect(screen.getByLabelText('Cuotas ya pagadas')).toBeDisabled();
  });

  it('hides the paid field when editing an open-ended payment', () => {
    const onSubmit = setup({ ...initial, totalInstallments: null, paidInstallments: 0 });
    expect(screen.queryByLabelText('Cuotas ya pagadas')).not.toBeInTheDocument();
    submit();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ totalInstallments: null, paidInstallments: null }));
  });
});

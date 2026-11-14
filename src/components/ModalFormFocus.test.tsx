/**
 * Regression checks for typing and parent updates across modal forms.
 *
 * @packageDocumentation
 */
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { NewCategoryModal, EditCategoryModal } from '@/components/categories/CategoryModals';
import { LimitModal } from '@/components/budget/LimitModal';
import { ExchangeRateModal } from '@/components/overview/ExchangeRateModal';
import { ContributeModal } from '@/components/savings/ContributeModal';
import { PayCardModal } from '@/components/cards/PayCardModal';
import { SettleDueModal } from '@/components/obligations/SettleDueModal';
import { HistoryFilterModal, type HistoryFilterValues } from '@/components/transactions/HistoryFilterModal';

const category = { id: 'c1', name: 'Servicios', nature: 'EXPENSE' as const, status: 'ACTIVE' as const };
const accounts = [{ id: 'a1', alias: 'Cuenta', currency: 'PEN' as const, balance: 500 }];
const filters: HistoryFilterValues = { from: '2026-11-01', to: '2026-11-30', month: '2026-11', currency: '', categoryId: '', instrumentId: '', text: '', nature: 'ALL', essentiality: 'ALL', status: 'ALL' };
const common = { isSaving: false, error: null };
const cases: { name: string; field: string; text: string; openOtherAmount?: boolean; form: (close: () => void) => ReactElement }[] = [
  { name: 'new category', field: 'Nombre', text: 'Compras del hogar', form: (onClose) => <NewCategoryModal {...common} isOpen nature="EXPENSE" onCreate={vi.fn()} onClose={onClose} /> },
  { name: 'edit category', field: 'Nombre', text: 'Servicios de casa', form: (onClose) => <EditCategoryModal {...common} category={category} movements={2} onRename={vi.fn()} onDeactivate={vi.fn()} onReactivate={vi.fn()} onClose={onClose} /> },
  { name: 'budget limit', field: 'Límite', text: '123.45', form: (onClose) => <LimitModal isOpen categories={[{ value: 'c1', label: 'Servicios' }]} categoryId="c1" limits={{}} monthLabel="Noviembre 2026" currencyLabel="PEN" currency="PEN" isSaving={false} onSave={vi.fn()} onClose={onClose} /> },
  { name: 'exchange rate', field: 'Soles por 1 dólar', text: '3.789', form: (onClose) => <ExchangeRateModal {...common} isOpen onSubmit={vi.fn()} onClose={onClose} /> },
  { name: 'savings contribution amount', field: 'Importe', text: '123.45', form: (onClose) => <ContributeModal {...common} goalName="Meta" currency="PEN" accounts={accounts} onSubmit={vi.fn()} onClose={onClose} /> },
  { name: 'savings contribution description', field: 'Descripción (opcional)', text: 'Aporte del mes', form: (onClose) => <ContributeModal {...common} goalName="Meta" currency="PEN" accounts={accounts} onSubmit={vi.fn()} onClose={onClose} /> },
  { name: 'card payment', field: 'Importe', text: '123.45', form: (onClose) => <PayCardModal {...common} isOpen cardName="Visa" currency="PEN" accounts={accounts} cycles={[{ cycleStart: '2026-10-02', closingDate: '2026-11-01', paymentDueDate: '2026-11-20', billed: 200, paid: 0, amountDue: 200, status: 'OPEN' }]} onSubmit={vi.fn()} onClose={onClose} /> },
  { name: 'fixed payment amount', field: 'Monto pagado (opcional)', text: '123.45', openOtherAmount: true, form: (onClose) => <SettleDueModal {...common} due={{ id: 'd1', fixedPaymentId: 'f1', description: 'Internet', kind: 'HOUSEHOLD_SERVICES', dueDate: '2026-11-20', expectedAmount: 99, paidAmount: null, currency: 'PEN', installment: null, usualPaymentMethodKind: 'ACCOUNT', usualInstrumentId: 'a1', status: 'PENDING' }} today="2026-11-13" means={[{ kind: 'ACCOUNT', id: 'a1', name: 'Cuenta' }]} categoryName="Servicios" onConfirm={vi.fn()} isSkipping={false} skipError={null} onSkip={vi.fn()} onClose={onClose} /> },
  { name: 'movement history search', field: 'Texto en descripción o comercio', text: 'Compra del mes', form: (onClose) => <HistoryFilterModal isOpen value={filters} defaults={filters} categories={[]} instruments={[]} onApply={vi.fn()} onClose={onClose} /> },
];

it.each(cases)('$name preserves text and focus across typing and parent updates', async ({ field, text, form, openOtherAmount }) => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const { rerender } = render(form(onClose));
  if (openOtherAmount) await user.click(screen.getByRole('button', { name: 'Pagué otro monto' }));
  const input = screen.getByLabelText(field);
  await user.clear(input);
  const split = Math.floor(text.length / 2);
  await user.type(input, text.slice(0, split));
  rerender(form(() => onClose()));
  expect(input).toHaveFocus();
  await user.keyboard(text.slice(split));
  expect(input).toHaveValue(text);
  expect(input).toHaveFocus();
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(onClose).not.toHaveBeenCalled();
  await user.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalledOnce();
});

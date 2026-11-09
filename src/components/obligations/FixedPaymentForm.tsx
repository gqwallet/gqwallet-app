/**
 * Fixed payment fields (12.10, 12.11, 12.12): description, fixed category, budget category,
 * currency, amount, due day, start month, installments and usual means.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { Callout, MonthField, SelectField, TextField, type SelectOption } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { FixedPayment, FixedPaymentKind, RegisterFixedPaymentInput } from '@/types/obligation';
import type { PaymentMethodKind } from '@/types/transaction';
import { clampMonth } from '@/utils/dateLimits';
import { formatAmount, formatMonth, monthOf } from '@/utils/format';
import { installmentEndMonth } from '@/utils/installments';
import { CURRENCY_OPTIONS, FIXED_KIND_LABEL, toOptions } from '@/utils/options';
import { parseAmount } from '@/utils/parse';

/** Account or card offered as usual means. */
export interface MeansOption {
  /** `ACCOUNT:id` or `CARD:id`. */
  value: string;
  /** Visible name. */
  label: string;
  /** Currency. */
  currency: Currency;
}

/** Props of {@link FixedPaymentForm}. */
export interface FixedPaymentFormProps {
  /** Form id, so external buttons can submit it. */
  id: string;
  /** Fixed payment to edit; kind, currency, start and installments are then fixed. */
  initial?: FixedPayment | null;
  /** Usual means of the payment being edited, as `KIND:id`. */
  initialMeans?: string;
  /** Expense categories. */
  categories: SelectOption[];
  /** Accounts and cards. */
  means: MeansOption[];
  /** Default currency. */
  defaultCurrency: Currency;
  /** Today as ISO date. */
  today: string;
  /** Called with valid values. */
  onSubmit: (input: RegisterFixedPaymentInput) => void;
}

interface Errors {
  description?: string;
  categoryId?: string;
  amount?: string;
  dueDay?: string;
  installments?: string;
  paidInstallments?: string;
}

/**
 * Renders and validates the fixed payment fields.
 *
 * @example
 * ```tsx
 * <FixedPaymentForm id="fp" categories={cats} means={means} defaultCurrency="PEN" today={today} onSubmit={save} />
 * ```
 */
export function FixedPaymentForm({ id, initial, initialMeans = '', categories, means, defaultCurrency, today, onSubmit }: FixedPaymentFormProps) {
  const [description, setDescription] = useState(initial?.description ?? '');
  const [kind, setKind] = useState<FixedPaymentKind>(initial?.kind ?? 'HOUSEHOLD_SERVICES');
  const [categoryId, setCategoryId] = useState(initial?.budgetCategoryId ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? defaultCurrency);
  const [amount, setAmount] = useState(initial ? formatAmount(initial.amount) : '');
  const [dueDay, setDueDay] = useState(String(initial?.dueDay ?? 1));
  const [startMonth, setStartMonth] = useState(initial?.startMonth ?? clampMonth(monthOf(today)));
  const [installments, setInstallments] = useState(initial?.totalInstallments ? String(initial.totalInstallments) : '');
  const [paidInstallments, setPaidInstallments] = useState(initial ? String(initial.paidInstallments) : '');
  const [usual, setUsual] = useState(initialMeans);
  const [errors, setErrors] = useState<Errors>({});
  const isEdit = Boolean(initial);
  const total = installments.trim() ? Number(installments) : null;
  const paid = total !== null ? Number(paidInstallments.trim() || '0') : null;
  const endMonth = installmentEndMonth(startMonth, total, paid ?? 0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = parseAmount(amount);
    const day = Number(dueDay);
    const next: Errors = {};
    if (!description.trim()) next.description = 'Ingresa una descripción.';
    if (!categoryId) next.categoryId = 'Elige la categoría de gasto que afectará tu presupuesto.';
    if (value === null || value <= 0) next.amount = 'Ingresa un monto mayor a cero.';
    if (!Number.isInteger(day) || day < 1 || day > 31) next.dueDay = 'Elige un día entre 1 y 31.';
    if (total !== null && (!Number.isInteger(total) || total <= 0)) next.installments = 'Si indicas cuotas, deben ser mayores a cero.';
    if (paid !== null) {
      if (!Number.isInteger(paid) || paid < 0) next.paidInstallments = 'Ingresa un número entero desde 0.';
      else if (total !== null && Number.isInteger(total) && total > 0 && paid >= total) next.paidInstallments = 'Deben ser menos que el número total de cuotas.';
    }
    setErrors(next);
    if (Object.keys(next).length || value === null) return;
    const [meansKind, meansId] = usual ? usual.split(':') : [null, null];
    onSubmit({
      description: description.trim(),
      kind,
      budgetCategoryId: categoryId,
      amount: value,
      currency,
      dueDay: day,
      startMonth,
      totalInstallments: total,
      paidInstallments: paid,
      usualPaymentMethodKind: meansKind as PaymentMethodKind | null,
      usualInstrumentId: meansId,
    });
  };

  const hasErrors = Object.keys(errors).length > 0;
  return (
    <form id={id} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      {hasErrors && <Callout tone="danger" title="No guardamos el pago fijo" text="Corrige los campos marcados para continuar." />}
      <div className="grid gap-4 lg:grid-cols-2">
        <TextField label="Descripción" value={description} onChange={setDescription} error={errors.description} />
        <SelectField
          label="Categoría fija"
          value={kind}
          options={toOptions(FIXED_KIND_LABEL)}
          onChange={(value) => setKind(value as FixedPaymentKind)}
          disabled={isEdit}
          helper={isEdit ? undefined : 'Servicios del hogar, Suscripciones, Membresías, Deuda, Alquiler o Consumo en cuotas.'}
        />
        <SelectField
          label="Categoría de gasto para el presupuesto"
          value={categoryId}
          options={categories}
          placeholder="Elige una categoría"
          onChange={setCategoryId}
          error={errors.categoryId}
        />
        <SelectField label="Moneda" value={currency} options={CURRENCY_OPTIONS} onChange={(value) => setCurrency(value as Currency)} disabled={isEdit} />
        <TextField label="Monto mensual" inputMode="decimal" placeholder="0.00" value={amount} onChange={setAmount} error={errors.amount} />
        <TextField
          label="Día de vencimiento"
          inputMode="numeric"
          value={dueDay}
          onChange={setDueDay}
          helper={isEdit ? undefined : 'Si el mes tiene menos días, vence el último día del mes.'}
          error={errors.dueDay}
        />
        {!isEdit && <MonthField label="Mes de inicio" value={startMonth} onChange={setStartMonth} />}
        <TextField
          label="Número total de cuotas"
          inputMode="numeric"
          value={installments}
          onChange={setInstallments}
          disabled={isEdit}
          helper={isEdit ? undefined : `Opcional. Numeramos de ${paid !== null && Number.isInteger(paid) && paid > 0 ? paid + 1 : 1}/${installments || 'N'} a ${installments || 'N'}/${installments || 'N'} y lo finalizamos tras la última.`}
          error={errors.installments}
        />
        {total !== null && (
          <TextField
            label="Cuotas ya pagadas"
            inputMode="numeric"
            value={paidInstallments}
            onChange={setPaidInstallments}
            disabled={isEdit}
            helper={
              <>
                Opcional. Las que pagaste antes de usar GQWallet: no se registran como gastos.
                {endMonth && <span className="block">Próxima: cuota {(paid ?? 0) + 1} de {total} · termina en {formatMonth(endMonth, true).toLowerCase()}</span>}
              </>
            }
            error={errors.paidInstallments}
          />
        )}
        <SelectField
          label="Medio de pago habitual"
          value={usual}
          placeholder="Sin medio habitual"
          options={means.filter((option) => option.currency === currency)}
          onChange={setUsual}
          helper={isEdit ? undefined : 'Opcional. Se precarga al confirmar cada pago.'}
        />
      </div>
    </form>
  );
}

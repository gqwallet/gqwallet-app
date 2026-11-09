/**
 * Card fields (11.2, 11.3, 11.4): name, bank, line currency and amount, fixed days, insurance and color.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { Callout, ChipGroup, SelectField, TextField } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { Card, RegisterCardInput } from '@/types/card';
import type { Bank } from '@/types/catalog';
import { CARD_COLORS } from '@/utils/cardPalette';
import { formatAmount, nextDayOfMonth, parseIsoDate } from '@/utils/format';
import { CURRENCY_OPTIONS } from '@/utils/options';
import { parseAmount } from '@/utils/parse';

const DAYS = Array.from({ length: 31 }, (_, index) => ({ value: String(index + 1), label: String(index + 1).padStart(2, '0') }));

/** Props of {@link CardForm}. */
export interface CardFormProps {
  /** Form id, so external buttons can submit it. */
  id: string;
  /** Active banks from the profile country. */
  banks: Bank[];
  /** Card to edit. */
  initial?: Card | null;
  /** Whether the card has movements, which locks its currency. */
  hasMovements?: boolean;
  /** Default currency. */
  defaultCurrency: Currency;
  /** Today as ISO date, to compute the next billing and payment dates. */
  today: string;
  /** Called with valid values. */
  onSubmit: (input: RegisterCardInput) => void;
}

interface Errors {
  name?: string;
  bank?: string;
  creditLine?: string;
  paymentDay?: string;
  insurance?: string;
}

/**
 * Renders the card fields, turns the fixed days into the next billing and payment dates and
 * validates them.
 *
 * @example
 * ```tsx
 * <CardForm id="card" defaultCurrency="PEN" today={today} onSubmit={save} />
 * ```
 */
export function CardForm({ id, banks, initial, hasMovements = false, defaultCurrency, today, onSubmit }: CardFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [bank, setBank] = useState(initial?.bankId ?? (initial?.customBankName ? 'OTHER' : ''));
  const [customBankName, setCustomBankName] = useState(initial?.customBankName ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? defaultCurrency);
  const [creditLine, setCreditLine] = useState(initial ? formatAmount(initial.creditLine) : '');
  const [billingDay, setBillingDay] = useState(initial ? String(parseIsoDate(initial.billingDate).getDate()) : '10');
  const [paymentDay, setPaymentDay] = useState(initial ? String(parseIsoDate(initial.paymentDueDate).getDate()) : '28');
  const [insurance, setInsurance] = useState(initial?.insurancePercentage !== null && initial?.insurancePercentage !== undefined ? initial.insurancePercentage.toFixed(2) : '');
  const [color, setColor] = useState(initial?.color.toUpperCase() ?? CARD_COLORS[0].hex);
  const [errors, setErrors] = useState<Errors>({});
  const bankOptions = [{ value: '', label: 'Selecciona un banco' }, ...banks.map((item) => ({ value: item.id, label: item.name })),
    ...(initial?.bankId && !banks.some((item) => item.id === initial.bankId) ? [{ value: initial.bankId, label: initial.bankName ?? 'Banco no disponible' }] : []),
    { value: 'OTHER', label: 'Otro banco' }];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const line = parseAmount(creditLine);
    const percent = insurance.trim() ? parseAmount(insurance) : null;
    const next: Errors = {};
    if (!name.trim()) next.name = 'Ingresa un nombre.';
    if (line === null || line <= 0) next.creditLine = 'Ingresa una línea de crédito mayor a cero.';
    if (Number(paymentDay) < Number(billingDay)) next.paymentDay = 'La fecha de pago no puede ser anterior a la fecha de facturación.';
    if (insurance.trim() && (percent === null || percent < 0 || percent > 100)) next.insurance = 'Ingresa un porcentaje entre 0 % y 100 %.';
    if (!bank || (bank === 'OTHER' && (!customBankName.trim() || customBankName.trim().length > 150))) next.bank = 'Selecciona un banco o ingresa su nombre (máximo 150 caracteres).';
    setErrors(next);
    if (Object.keys(next).length || line === null) return;
    const billingDate = nextDayOfMonth(Number(billingDay), today);
    const paymentDueDate = nextDayOfMonth(Number(paymentDay), billingDate);
    onSubmit({ name: name.trim(), bankId: bank === 'OTHER' ? null : bank, customBankName: bank === 'OTHER' ? customBankName.trim() : null, currency, creditLine: line, billingDate, paymentDueDate, color, insurancePercentage: percent });
  };

  const hasErrors = Object.keys(errors).length > 0;
  return (
    <form id={id} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      {hasErrors && <Callout tone="danger" title="No guardamos la tarjeta" text="Corrige los campos marcados para continuar." />}
      <div className="grid gap-4 lg:grid-cols-2">
        <TextField label="Nombre" value={name} onChange={setName} error={errors.name} />
        <SelectField label="Banco" value={bank} options={bankOptions} onChange={setBank} error={errors.bank} />
        {bank === 'OTHER' && <TextField label="Nombre del banco" value={customBankName} onChange={setCustomBankName} maxLength={150} error={errors.bank} />}
        <SelectField
          label="Moneda de la línea"
          value={currency}
          options={CURRENCY_OPTIONS}
          onChange={(value) => setCurrency(value as Currency)}
          disabled={Boolean(initial)}
          helper={initial && hasMovements ? 'No puedes cambiar la moneda: la tarjeta tiene movimientos.' : undefined}
        />
        <TextField label="Línea de crédito" inputMode="decimal" value={creditLine} onChange={setCreditLine} error={errors.creditLine} />
        <SelectField label="Día de facturación" value={billingDay} options={DAYS} onChange={setBillingDay} />
        <SelectField label="Día de pago" value={paymentDay} options={DAYS} onChange={setPaymentDay} error={errors.paymentDay} />
        <TextField label="Seguro desgravamen (%)" inputMode="decimal" value={insurance} onChange={setInsurance} helper="Opcional. Entre 0 % y 100 %." error={errors.insurance} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-label text-content-secondary">Color para identificarla</span>
        <ChipGroup label="Color para identificarla" options={CARD_COLORS.map((option) => ({ value: option.hex, label: option.label }))} value={color} onChange={setColor} />
      </div>
      {!initial && <Callout icon="event" title="Fechas fijas" text="La fecha de facturación y la de pago se repiten cada mes y se muestran en tu calendario." />}
    </form>
  );
}

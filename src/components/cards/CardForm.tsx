/**
 * Card fields (11.2, 11.3, 11.4): name, bank, line currency and amount, fixed days, insurance and color.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState, type FormEvent } from 'react';
import { Button, Callout, ChipGroup, SelectField, TextField, TimeField } from '@/components/ui';
import type { Currency } from '@/types/api';
import type { BillingCycleOption, Card, RegisterCardInput } from '@/types/card';
import type { Bank } from '@/types/catalog';
import { CARD_COLORS } from '@/utils/cardPalette';
import { formatAmount, formatShortDate, nextDayOfMonth, parseIsoDate } from '@/utils/format';
import { CURRENCY_OPTIONS } from '@/utils/options';
import { openingDebtCycles } from '@/utils/openingDebtCycles';
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
  /** Confirmed cycle options from the server when editing. */
  billingCycles?: BillingCycleOption[];
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
  openingDebts?: string;
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
export function CardForm({ id, banks, initial, billingCycles = [], hasMovements = false, defaultCurrency, today, onSubmit }: CardFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [bank, setBank] = useState(initial?.bankId ?? (initial?.customBankName ? 'OTHER' : ''));
  const [customBankName, setCustomBankName] = useState(initial?.customBankName ?? '');
  const [currency, setCurrency] = useState<Currency>(initial?.currency ?? defaultCurrency);
  const [creditLine, setCreditLine] = useState(initial ? formatAmount(initial.creditLine) : '');
  const [billingDay, setBillingDay] = useState(initial ? String(parseIsoDate(initial.billingDate).getDate()) : '10');
  const [billingCutoffTime, setBillingCutoffTime] = useState(initial?.billingCutoffTime ?? '');
  const [paymentDay, setPaymentDay] = useState(initial ? String(parseIsoDate(initial.paymentDueDate).getDate()) : '28');
  const [insurance, setInsurance] = useState(initial?.insurancePercentage !== null && initial?.insurancePercentage !== undefined ? initial.insurancePercentage.toFixed(2) : '');
  const [color, setColor] = useState(initial?.color.toUpperCase() ?? CARD_COLORS[0].hex);
  const [debts, setDebts] = useState((initial?.openingDebts ?? []).map((debt) => ({ amount: formatAmount(debt.amount), closingDate: debt.closingDate })));
  const cycles = initial ? [...billingCycles].sort((a, b) => a.closingDate.localeCompare(b.closingDate)) : openingDebtCycles(Number(billingDay), Number(paymentDay), today);
  const defaultClosingDate = [...cycles].filter((cycle) => cycle.closingDate < today).at(-1)?.closingDate ?? cycles[0]?.closingDate ?? '';
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
    // A payment day before the billing day falls in the following month (billing 10, payment 05 of next month).
    if (Number(paymentDay) === Number(billingDay)) next.paymentDay = 'El día de pago no puede ser el mismo día de facturación.';
    if (insurance.trim() && (percent === null || percent < 0 || percent > 100)) next.insurance = 'Ingresa un porcentaje entre 0 % y 100 %.';
    if (!bank || (bank === 'OTHER' && (!customBankName.trim() || customBankName.trim().length > 150))) next.bank = 'Selecciona un banco o ingresa su nombre (máximo 150 caracteres).';
    const openingDebts = debts.map((debt) => ({ amount: parseAmount(debt.amount), closingDate: debt.closingDate }));
    if (openingDebts.some((debt) => debt.amount === null || debt.amount <= 0 || !cycles.some((cycle) => cycle.closingDate === debt.closingDate))) next.openingDebts = 'Ingresa un monto mayor a cero y confirma una facturación válida en cada fila.';
    setErrors(next);
    if (Object.keys(next).length || line === null) return;
    const billingDate = nextDayOfMonth(Number(billingDay), today);
    const paymentDueDate = nextDayOfMonth(Number(paymentDay), billingDate);
    onSubmit({ name: name.trim(), bankId: bank === 'OTHER' ? null : bank, customBankName: bank === 'OTHER' ? customBankName.trim() : null, currency, creditLine: line, billingDate, billingCutoffTime: billingCutoffTime || null, paymentDueDate, color, insurancePercentage: percent, openingDebts: openingDebts.map((debt) => ({ amount: debt.amount as number, closingDate: debt.closingDate })) });
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
        <SelectField label="Día de facturación" value={billingDay} options={DAYS} onChange={(value) => { setBillingDay(value); if (!initial) setDebts((rows) => rows.map((row) => ({ ...row, closingDate: '' }))); }} />
        <SelectField
          label="Día de pago"
          value={paymentDay}
          options={DAYS}
          onChange={setPaymentDay}
          helper={Number(paymentDay) < Number(billingDay) ? 'Se paga en el mes siguiente al corte.' : 'Se paga en el mismo mes del corte.'}
          error={errors.paymentDay}
        />
        <TimeField
          label="Hora de corte"
          value={billingCutoffTime}
          onChange={setBillingCutoffTime}
          helper="Opcional. Revisa tu contrato: los consumos del día de facturación después de esta hora pasan al ciclo siguiente. Si la dejas vacía, cuenta todo el día."
        />
        <TextField label="Seguro desgravamen (%)" inputMode="decimal" value={insurance} onChange={setInsurance} helper="Opcional. Entre 0 % y 100 %." error={errors.insurance} />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-label text-content-secondary">Color para identificarla</span>
        <ChipGroup label="Color para identificarla" options={CARD_COLORS.map((option) => ({ value: option.hex, label: option.label }))} value={color} onChange={setColor} />
      </div>
      <section aria-label="Deuda inicial (opcional)" className="flex flex-col gap-3 border-t border-line-subtle pt-4">
        <h2 className="text-subtitle">Deuda inicial (opcional)</h2>
        <p className="text-body-s text-content-muted">Registra solo deudas anteriores que aún no hayas registrado como consumos. No cuentan como gasto ni presupuesto.</p>
        {debts.map((debt, index) => <div key={index} className="grid items-end gap-3 lg:grid-cols-[1fr_2fr_auto]">
          <TextField label={`Monto ${index + 1}`} inputMode="decimal" value={debt.amount} onChange={(value) => setDebts((rows) => rows.map((row, i) => i === index ? { ...row, amount: value } : row))} />
          <SelectField label={`Facturación ${index + 1}`} value={debt.closingDate} placeholder="Confirma la facturación" options={cycles.map((cycle) => ({ value: cycle.closingDate, label: `Factura el ${formatShortDate(cycle.closingDate, true)} · paga hasta ${formatShortDate(cycle.paymentDueDate, true)}` }))} onChange={(value) => setDebts((rows) => rows.map((row, i) => i === index ? { ...row, closingDate: value } : row))} />
          <Button label={`Quitar facturación ${index + 1}`} icon="delete" variant="ghost" onClick={() => setDebts((rows) => rows.filter((_, i) => i !== index))} />
        </div>)}
        {errors.openingDebts && <p role="alert" className="text-caption text-danger">{errors.openingDebts}</p>}
        <Button label="Agregar otra facturación" icon="add" variant="soft" disabled={cycles.length === 0} onClick={() => setDebts((rows) => [...rows, { amount: '', closingDate: defaultClosingDate }])} />
      </section>
      {!initial && <Callout icon="event" title="Fechas fijas" text="La fecha de facturación y la de pago se repiten cada mes y se muestran en tu calendario." />}
    </form>
  );
}

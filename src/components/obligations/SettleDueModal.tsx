/**
 * One-step payment confirmation of a due (12.1 to 12.4, FR-030).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { BreakdownRow, Button, Callout, ChipGroup, Modal, TextField } from '@/components/ui';
import type { PaymentDue, SettleDueInput } from '@/types/obligation';
import type { PaymentMethodKind } from '@/types/transaction';
import { formatMoney, formatShortDate } from '@/utils/format';
import { FIXED_KIND_LABEL } from '@/utils/options';
import { parseAmount } from '@/utils/parse';

/** Payment means offered in the dialog. */
export interface SettleMeansOption {
  /** `ACCOUNT` or `CARD`. */
  kind: PaymentMethodKind;
  /** Account or card id. */
  id: string;
  /** Visible name. */
  name: string;
}

/** Props of {@link SettleDueModal}. */
export interface SettleDueModalProps {
  /** Due to pay, or `null` when closed. */
  due: PaymentDue | null;
  /** Today as ISO date. */
  today: string;
  /** Means in the due currency. */
  means: SettleMeansOption[];
  /** Name of the budget category charged. */
  categoryName: string | null;
  /** Whether the payment is saving. */
  isSaving: boolean;
  /** Server error. */
  error: string | null;
  /** Called with the payment. */
  onConfirm: (input: SettleDueInput) => void;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the expected amount, the usual means (or a picker when there is none), the date and an
 * optional different amount.
 *
 * @example
 * ```tsx
 * <SettleDueModal due={due} today={today} means={means} categoryName="Servicios" isSaving={false} error={null} onConfirm={pay} onClose={close} />
 * ```
 */
export function SettleDueModal({ due, today, means, categoryName, isSaving, error, onConfirm, onClose }: SettleDueModalProps) {
  const [meansId, setMeansId] = useState('');
  const [showOther, setShowOther] = useState(false);
  const [paid, setPaid] = useState('');
  const [paidError, setPaidError] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  if ((due?.id ?? null) !== current) {
    setCurrent(due?.id ?? null);
    setMeansId('');
    setShowOther(false);
    setPaid('');
    setPaidError(null);
  }
  if (!due) return null;

  const usual = due.usualInstrumentId ? means.find((option) => option.id === due.usualInstrumentId) : undefined;
  const chosen = usual ?? means.find((option) => option.id === meansId);
  const money = (value: number) => formatMoney(value, due.currency);
  const paidValue = showOther && paid.trim() ? parseAmount(paid) : null;
  const amount = paidValue ?? due.expectedAmount;

  const handleConfirm = () => {
    if (showOther && paid.trim() && (paidValue === null || paidValue <= 0)) {
      setPaidError('Ingresa un monto mayor a cero. El vencimiento sigue pendiente.');
      return;
    }
    if (!chosen) return;
    setPaidError(null);
    onConfirm({ paymentMethodKind: chosen.kind, instrumentId: chosen.id, economicDate: today, paidAmount: paidValue });
  };

  return (
    <Modal
      isOpen
      icon="task_alt"
      title={`Confirmar pago de ${due.description}`}
      description={`Vencimiento del ${formatShortDate(due.dueDate)} · ${FIXED_KIND_LABEL[due.kind]}`}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label={paidError ? 'Corregir monto' : 'Confirmar pago'} icon="check" isLoading={isSaving} disabled={!chosen} onClick={handleConfirm} />
        </>
      }
    >
      <div>
        <BreakdownRow label="Monto esperado" value={money(due.expectedAmount)} />
        {usual && <BreakdownRow label="Medio de pago" value={`${usual.name} · habitual`} />}
        <BreakdownRow label="Fecha de pago" value={`Hoy, ${formatShortDate(today, true)}`} />
      </div>
      {!usual && (
        <div className="flex flex-col gap-1.5">
          <span className="text-label text-content-secondary">Medio de pago</span>
          <ChipGroup label="Medio de pago" options={means.map((option) => ({ value: option.id, label: option.name }))} value={meansId || null} onChange={setMeansId} />
          <p className="text-caption text-content-muted">{due.description} no tiene un medio de pago habitual: elige uno para confirmar.</p>
        </div>
      )}
      {showOther ? (
        <TextField
          label="Monto pagado (opcional)"
          inputMode="decimal"
          value={paid}
          onChange={setPaid}
          helper={`Reemplaza al esperado solo en este vencimiento. ${due.description} seguirá en ${money(due.expectedAmount)} los próximos meses.`}
          error={paidError ?? error}
        />
      ) : (
        <>
          {chosen && (
            <Callout
              title="Al confirmar"
              text={`Creamos un gasto de ${money(amount)}${categoryName ? ` en ${categoryName}` : ''}, pagado con ${chosen.name}, y el vencimiento pasa a «Pagado».`}
            />
          )}
          {error && <Callout tone="danger" text={error} />}
          <Button label="Pagué otro monto" icon="edit" variant="ghost" className="self-start" onClick={() => setShowOther(true)} />
        </>
      )}
    </Modal>
  );
}

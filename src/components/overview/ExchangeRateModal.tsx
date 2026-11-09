/**
 * Dialog to register a referential PEN/USD exchange rate (05.6).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { Button, Modal, TextField } from '@/components/ui';
import type { RegisterExchangeRateInput } from '@/types/profile';
import { todayIso } from '@/utils/format';
import { parseAmount } from '@/utils/parse';

/** Props of {@link ExchangeRateModal}. */
export interface ExchangeRateModalProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Whether the rate is being saved. */
  isSaving: boolean;
  /** Server error. */
  error: string | null;
  /** Called with the rate; resolves whether it was saved. */
  onSubmit: (input: RegisterExchangeRateInput) => Promise<boolean>;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the rate form and closes itself after a successful save.
 *
 * @example
 * ```tsx
 * <ExchangeRateModal isOpen={isOpen} isSaving={isSaving} error={error} onSubmit={registerRate} onClose={close} />
 * ```
 */
export function ExchangeRateModal({ isOpen, isSaving, error, onSubmit, onClose }: ExchangeRateModalProps) {
  const [rate, setRate] = useState('');
  const [date, setDate] = useState(todayIso());
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSave = async () => {
    const value = parseAmount(rate);
    if (value === null || value <= 0 || !date) {
      setFieldError('Ingresa un tipo de cambio mayor a cero.');
      return;
    }
    setFieldError(null);
    if (await onSubmit({ penPerUsd: value, effectiveDate: date })) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      icon="currency_exchange"
      title="Registrar tipo de cambio"
      description="Se usa solo en la vista consolidada y siempre se muestra con su fecha."
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label="Guardar" isLoading={isSaving} onClick={handleSave} />
        </>
      }
    >
      <TextField label="Soles por 1 dólar" inputMode="decimal" value={rate} onChange={setRate} error={fieldError ?? error} />
      <TextField label="Fecha del tipo de cambio" type="date" value={date} onChange={setDate} />
    </Modal>
  );
}

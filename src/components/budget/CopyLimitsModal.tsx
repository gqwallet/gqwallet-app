/**
 * Dialog to copy limits from another month without overwriting (13.3).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useState } from 'react';
import { BreakdownRow, Button, Modal, MonthPickerPanel, SelectField } from '@/components/ui';

/** Counts shown before copying. */
export interface CopyCounts {
  /** Limits in the source month. */
  source: number;
  /** Limits already in the target month. */
  existing: number;
  /** Limits that will be created. */
  toCreate: number;
}

/** Props of {@link CopyLimitsModal}. */
export interface CopyLimitsModalProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Default source month. */
  defaultSource: string;
  /** Target month label. */
  targetLabel: string;
  /** Currency label. */
  currencyLabel: string;
  /** Short name of a month key, e.g. `mayo`. */
  monthName: (period: string) => string;
  /** Loads the counts of a source month. */
  onPreview: (fromPeriod: string) => Promise<CopyCounts>;
  /** Whether the copy is running. */
  isSaving: boolean;
  /** Called with the source month. */
  onCopy: (fromPeriod: string) => void;
  /** Called to close. */
  onClose: () => void;
}

/**
 * Renders the source month, the counts and the copy action.
 *
 * @example
 * ```tsx
 * <CopyLimitsModal isOpen defaultSource="2026-05" targetLabel="Junio 2026" currencyLabel="PEN · Soles" monthName={name} onPreview={preview} isSaving={false} onCopy={copy} onClose={close} />
 * ```
 */
export function CopyLimitsModal({ isOpen, defaultSource, targetLabel, currencyLabel, monthName, onPreview, isSaving, onCopy, onClose }: CopyLimitsModalProps) {
  const [source, setSource] = useState(defaultSource);
  const [counts, setCounts] = useState<CopyCounts | null>(null);
  useEffect(() => {
    if (!isOpen) return undefined;
    let isCurrent = true;
    setCounts(null);
    void onPreview(source).then((result) => isCurrent && setCounts(result)).catch(() => undefined);
    return () => {
      isCurrent = false;
    };
  }, [isOpen, source, onPreview]);
  const target = targetLabel.split(' ')[0].toLowerCase();
  return (
    <Modal
      isOpen={isOpen}
      icon="content_copy"
      title="Copiar límites de otro mes"
      description="Solo creamos los límites que no existan en el mes de destino."
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label="Copiar límites" isLoading={isSaving} disabled={!counts || counts.toCreate === 0} onClick={() => onCopy(source)} />
        </>
      }
    >
      <SelectField label="Hacia" value="target" options={[{ value: 'target', label: targetLabel }]} onChange={() => undefined} disabled />
      <div className="flex flex-col gap-1.5">
        <span className="text-label text-content-secondary">Copiar desde · {monthName(source)}</span>
        <MonthPickerPanel value={source} onChange={setSource} />
      </div>
      <SelectField label="Moneda" value="currency" options={[{ value: 'currency', label: currencyLabel }]} onChange={() => undefined} disabled />
      {counts && (
        <div>
          <BreakdownRow label={`Límites en ${monthName(source)}`} value={String(counts.source)} />
          <BreakdownRow label={`Ya definidos en ${target}`} value={`${counts.existing} · se conservan`} />
          <BreakdownRow label={`Se crearán en ${target}`} value={String(counts.toCreate)} tone="total" />
        </div>
      )}
    </Modal>
  );
}

/**
 * Month and year pickers: a year header with arrows over a grid of months (or years).
 * Earlier periods than the minimum are disabled; there is no upper limit.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { PickerField } from '@/components/ui/PickerField';
import { cn } from '@/utils/cn';
import { MIN_MONTH, MIN_YEAR } from '@/utils/dateLimits';
import { formatMonth, MONTHS_SHORT } from '@/utils/format';

/** Years shown per page of the year grid. */
const YEARS_PER_PAGE = 12;

/** Props of {@link MonthPickerPanel}. */
export interface MonthPickerPanelProps {
  /** Selected month key `YYYY-MM`, a year `YYYY` when {@link MonthPickerPanelProps.allowYear}, or empty. */
  value: string;
  /** Earliest month key; earlier months are disabled. */
  min?: string;
  /** Adds a button to choose the whole year of the page. */
  allowYear?: boolean;
  /** Label of a button that clears the value, e.g. `Rango personalizado`. */
  emptyLabel?: string;
  /** Called with the chosen month key, year or empty string. */
  onChange: (value: string) => void;
}

/**
 * Renders a year navigator and the twelve months of that year, inline (e.g. inside a dialog form).
 *
 * @example
 * ```tsx
 * <MonthPickerPanel value="2026-11" onChange={setPeriod} />
 * ```
 */
export function MonthPickerPanel({ value, min = MIN_MONTH, allowYear = false, emptyLabel, onChange }: MonthPickerPanelProps) {
  const minYear = Number(min.slice(0, 4));
  const valueYear = value ? Number(value.slice(0, 4)) : new Date().getFullYear();
  const [year, setYear] = useState(Math.max(valueYear, minYear));
  useEffect(() => setYear(Math.max(valueYear, minYear)), [valueYear, minYear]);
  return (
    <div>
      <YearNavigator label={String(year)} canGoBack={year > minYear} onBack={() => setYear(year - 1)} onForward={() => setYear(year + 1)} />
      {(allowYear || emptyLabel) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {allowYear && <Chip label={`Todo ${year}`} isSelected={value === String(year)} onClick={() => onChange(String(year))} />}
          {emptyLabel && <Chip label={emptyLabel} isSelected={value === ''} onClick={() => onChange('')} />}
        </div>
      )}
      <div role="group" aria-label={`Meses de ${year}`} className="grid grid-cols-3 gap-2">
        {MONTHS_SHORT.map((short, index) => {
          const key = `${year}-${String(index + 1).padStart(2, '0')}`;
          return <PeriodButton key={key} label={short} ariaLabel={formatMonth(key, true)} isSelected={value === key} isDisabled={key < min} onClick={() => onChange(key)} />;
        })}
      </div>
    </div>
  );
}

/** Props of {@link MonthPickerDialog}. */
export interface MonthPickerDialogProps extends MonthPickerPanelProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Dialog title. */
  title: string;
  /** Called to close the dialog. */
  onClose: () => void;
}

/**
 * Renders {@link MonthPickerPanel} in a dialog that closes after a choice.
 *
 * @example
 * ```tsx
 * <MonthPickerDialog isOpen title="Elige el mes" value="2026-11" onChange={setPeriod} onClose={close} />
 * ```
 */
export function MonthPickerDialog({ isOpen, title, onChange, onClose, ...panel }: MonthPickerDialogProps) {
  return (
    <Modal isOpen={isOpen} title={title} icon="calendar_month" onClose={onClose}>
      <MonthPickerPanel
        {...panel}
        onChange={(next) => {
          onChange(next);
          onClose();
        }}
      />
    </Modal>
  );
}

/** Props of {@link YearPickerDialog}. */
export interface YearPickerDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Dialog title. */
  title: string;
  /** Selected year `YYYY`. */
  value: string;
  /** Earliest year; earlier years are not offered. */
  min?: number;
  /** Called with the chosen year. */
  onChange: (value: string) => void;
  /** Called to close the dialog. */
  onClose: () => void;
}

/**
 * Renders a dialog with pages of twelve years, starting at the minimum year.
 *
 * @example
 * ```tsx
 * <YearPickerDialog isOpen title={title} value="2026" onChange={setYear} onClose={close} />
 * ```
 */
export function YearPickerDialog({ isOpen, title, value, min = MIN_YEAR, onChange, onClose }: YearPickerDialogProps) {
  const pageOf = (year: number) => min + Math.floor(Math.max(0, year - min) / YEARS_PER_PAGE) * YEARS_PER_PAGE;
  const [start, setStart] = useState(pageOf(Number(value)));
  useEffect(() => {
    if (isOpen) setStart(min + Math.floor(Math.max(0, Number(value) - min) / YEARS_PER_PAGE) * YEARS_PER_PAGE);
  }, [isOpen, value, min]);
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, index) => String(start + index));
  return (
    <Modal isOpen={isOpen} title={title} icon="calendar_month" onClose={onClose}>
      <YearNavigator
        label={`${years[0]} – ${years[years.length - 1]}`}
        canGoBack={start > min}
        onBack={() => setStart(start - YEARS_PER_PAGE)}
        onForward={() => setStart(start + YEARS_PER_PAGE)}
      />
      <div role="group" aria-label="Años" className="grid grid-cols-3 gap-2">
        {years.map((year) => (
          <PeriodButton
            key={year}
            label={year}
            ariaLabel={year}
            isSelected={value === year}
            isDisabled={false}
            onClick={() => {
              onChange(year);
              onClose();
            }}
          />
        ))}
      </div>
    </Modal>
  );
}

/** Props of {@link MonthField}. */
export interface MonthFieldProps {
  /** Visible label. */
  label: string;
  /** Selected month key `YYYY-MM`, a year `YYYY`, or empty. */
  value: string;
  /** Earliest month key. */
  min?: string;
  /** Adds a button to choose a whole year. */
  allowYear?: boolean;
  /** Label of the empty choice, shown as placeholder too. */
  emptyLabel?: string;
  /** Called with the chosen value. */
  onChange: (value: string) => void;
  /** Helper below the control. */
  helper?: string;
  /** Error message. */
  error?: string | null;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a form field that opens {@link MonthPickerDialog}.
 *
 * @example
 * ```tsx
 * <MonthField label="Mes de inicio" value={startMonth} onChange={setStartMonth} />
 * ```
 */
export function MonthField({ label, value, min, allowYear, emptyLabel, onChange, helper, error, className }: MonthFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <PickerField label={label} valueText={periodText(value)} placeholder={emptyLabel ?? 'Elige un mes'} onOpen={() => setIsOpen(true)} helper={helper} error={error} className={className} />
      <MonthPickerDialog isOpen={isOpen} title={label} value={value} min={min} allowYear={allowYear} emptyLabel={emptyLabel} onChange={onChange} onClose={() => setIsOpen(false)} />
    </>
  );
}

/** Props of {@link MonthChip} and {@link YearChip}. */
export interface PeriodChipProps {
  /** Dialog title, e.g. `Elige el mes`. */
  title: string;
  /** Selected month key `YYYY-MM` or year `YYYY`. */
  value: string;
  /** Called with the chosen value. */
  onChange: (value: string) => void;
}

/**
 * Renders the selected month as a chip that opens {@link MonthPickerDialog}.
 *
 * @example
 * ```tsx
 * <MonthChip title="Elige el mes" value={period} onChange={setPeriod} />
 * ```
 */
export function MonthChip({ title, value, onChange }: PeriodChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Chip label={formatMonth(value, true)} isSelected onClick={() => setIsOpen(true)} />
      <MonthPickerDialog isOpen={isOpen} title={title} value={value} onChange={onChange} onClose={() => setIsOpen(false)} />
    </>
  );
}

/**
 * Renders the selected year as a chip that opens {@link YearPickerDialog}.
 *
 * @example
 * ```tsx
 * <YearChip title={title} value={year} onChange={setYear} />
 * ```
 */
export function YearChip({ title, value, onChange }: PeriodChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Chip label={value} isSelected onClick={() => setIsOpen(true)} />
      <YearPickerDialog isOpen={isOpen} title={title} value={value} onChange={onChange} onClose={() => setIsOpen(false)} />
    </>
  );
}

/**
 * Formats a picker value for display.
 *
 * @param value - Month key `YYYY-MM`, year `YYYY` or empty.
 * @returns `Noviembre 2026`, `Año 2026`, or `null` when empty.
 */
function periodText(value: string): string | null {
  if (!value) return null;
  return value.includes('-') ? formatMonth(value, true) : `Año ${value}`;
}

/** Props of {@link YearNavigator}. */
interface YearNavigatorProps {
  /** Text between the arrows. */
  label: string;
  /** Whether the previous page exists. */
  canGoBack: boolean;
  /** Goes to the previous page. */
  onBack: () => void;
  /** Goes to the next page. */
  onForward: () => void;
}

/** Renders `‹ label ›` with the back arrow disabled at the minimum. */
function YearNavigator({ label, canGoBack, onBack, onForward }: YearNavigatorProps) {
  const arrow = 'flex size-11 items-center justify-center rounded-md text-content-secondary hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 disabled:hover:bg-transparent';
  return (
    <div className="mb-3 flex items-center justify-between">
      <button type="button" aria-label="Anterior" disabled={!canGoBack} onClick={onBack} className={arrow}>
        <Icon name="chevron_left" />
      </button>
      <span className="text-title text-content-primary">{label}</span>
      <button type="button" aria-label="Siguiente" onClick={onForward} className={arrow}>
        <Icon name="chevron_right" />
      </button>
    </div>
  );
}

/** Props of {@link PeriodButton}. */
interface PeriodButtonProps {
  /** Visible text. */
  label: string;
  /** Accessible name. */
  ariaLabel: string;
  /** Whether it is the chosen value. */
  isSelected: boolean;
  /** Whether it is earlier than the minimum. */
  isDisabled: boolean;
  /** Called when pressed. */
  onClick: () => void;
}

/** Renders one cell of the month or year grid. */
function PeriodButton({ label, ariaLabel, isSelected, isDisabled, onClick }: PeriodButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        'h-11 rounded-md border text-body capitalize focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40',
        isSelected ? 'border-primary bg-primary text-content-on-primary' : 'border-line-outline bg-surface-card text-content-primary hover:bg-surface-container',
      )}
    >
      {label}
    </button>
  );
}

/**
 * Selected chip that opens a dialog to choose another value, e.g. a month or a year.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { ChipGroup, type ChipOption } from '@/components/ui/Chip';
import { Modal } from '@/components/ui/Modal';

/** Props of {@link ChipPicker}. */
export interface ChipPickerProps<TValue extends string> {
  /** Dialog title, e.g. `Elige el mes`. */
  title: string;
  /** Options. */
  options: ChipOption<TValue>[];
  /** Selected value. */
  value: TValue;
  /** Called with the chosen value. */
  onChange: (value: TValue) => void;
}

/**
 * Renders the selected option as a chip; pressing it lists every option.
 *
 * @example
 * ```tsx
 * <ChipPicker title="Elige el mes" options={months} value={period} onChange={setPeriod} />
 * ```
 */
export function ChipPicker<TValue extends string>({ title, options, value, onChange }: ChipPickerProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <>
      <Chip label={selected?.label ?? value} isSelected onClick={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} title={title} icon="calendar_month" onClose={() => setIsOpen(false)}>
        <ChipGroup
          label={title}
          isWrapping
          options={options}
          value={value}
          onChange={(next) => {
            onChange(next);
            setIsOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

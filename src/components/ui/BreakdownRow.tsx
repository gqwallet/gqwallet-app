/**
 * Label and amount line of a breakdown, with an optional emphasized total.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Tone of a breakdown amount. */
export type BreakdownTone = 'neutral' | 'income' | 'total' | 'danger';

const VALUE: Record<BreakdownTone, string> = {
  neutral: 'text-subtitle text-content-primary',
  income: 'text-subtitle text-secondary',
  total: 'text-title text-primary-on-container',
  danger: 'text-subtitle text-danger',
};

/** Props of {@link BreakdownRow}. */
export interface BreakdownRowProps {
  /** Left label. */
  label: ReactNode;
  /** Right value. */
  value: ReactNode;
  /**
   * Tone of the value; `total` adds a top border.
   *
   * @defaultValue `neutral`
   */
  tone?: BreakdownTone;
}

/**
 * Renders a breakdown line.
 *
 * @example
 * ```tsx
 * <BreakdownRow label="Disponible calculado" value="S/ 147,227.08" tone="total" />
 * ```
 */
export function BreakdownRow({ label, value, tone = 'neutral' }: BreakdownRowProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-2.5', tone === 'total' && 'mt-1 border-t border-line-outline pt-3')}>
      <span className={cn('text-body', tone === 'total' ? 'text-subtitle' : tone === 'danger' ? 'text-danger' : 'text-content-secondary')}>{label}</span>
      <span className={cn('text-right', VALUE[tone])}>{value}</span>
    </div>
  );
}

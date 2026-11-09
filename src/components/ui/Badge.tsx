/**
 * Small pill that labels a state.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** Tone of a badge. */
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'caution';

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-surface-high text-content-secondary',
  primary: 'bg-primary-container text-primary-on-container',
  success: 'bg-secondary-container text-secondary',
  warning: 'bg-tertiary-container text-tertiary',
  danger: 'bg-danger-container text-danger',
  caution: 'bg-caution-container text-caution',
};

/** Props of {@link Badge}. */
export interface BadgeProps {
  /** Visible text. */
  label: string;
  /**
   * Color tone.
   *
   * @defaultValue `primary`
   */
  tone?: BadgeTone;
  /** Leading icon ligature. */
  icon?: string;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a 24 px status pill.
 *
 * @example
 * ```tsx
 * <Badge label="Vencido" tone="danger" />
 * ```
 */
export function Badge({ label, tone = 'primary', icon, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-label whitespace-nowrap', TONE[tone], className)}>
      {icon && <Icon name={icon} size={16} />}
      {label}
    </span>
  );
}

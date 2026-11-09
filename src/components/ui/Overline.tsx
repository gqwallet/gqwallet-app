/**
 * Uppercase group label used inside lists and the sidebar.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';

/** Visual tone of an overline. */
export type OverlineTone = 'muted' | 'danger';

const TONE: Record<OverlineTone, string> = { muted: 'text-content-secondary', danger: 'text-danger' };

/** Props of {@link Overline}. */
export interface OverlineProps {
  /** Visible text; shown uppercase. */
  label: string;
  /**
   * Color tone.
   *
   * @defaultValue `muted`
   */
  tone?: OverlineTone;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a 10 px uppercase label.
 *
 * @example
 * ```tsx
 * <Overline label="Vencidos" tone="danger" />
 * ```
 */
export function Overline({ label, tone = 'muted', className }: OverlineProps) {
  return <p className={cn('text-overline uppercase', TONE[tone], className)}>{label}</p>;
}

/**
 * Inline message with icon, optional title and text.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** Tone of a callout. */
export type CalloutTone = 'primary' | 'warning' | 'danger' | 'success';

const SURFACE: Record<CalloutTone, string> = {
  primary: 'bg-primary-container',
  warning: 'bg-tertiary-container',
  danger: 'bg-danger-container',
  success: 'bg-secondary-container',
};
const ACCENT: Record<CalloutTone, string> = {
  primary: 'text-primary-on-container',
  warning: 'text-tertiary',
  danger: 'text-danger',
  success: 'text-secondary',
};
const GLYPH: Record<CalloutTone, string> = { primary: 'lightbulb', warning: 'schedule', danger: 'error', success: 'check_circle' };

/** Props of {@link Callout}. */
export interface CalloutProps {
  /** Message text. */
  text: ReactNode;
  /** Optional title. */
  title?: string;
  /**
   * Color tone.
   *
   * @defaultValue `primary`
   */
  tone?: CalloutTone;
  /** Icon ligature; defaults to the tone icon. */
  icon?: string;
  /** Element shown below the text, e.g. a button. */
  action?: ReactNode;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a tinted message box; danger callouts are announced as alerts.
 *
 * @example
 * ```tsx
 * <Callout tone="warning" title={title} text={text} />
 * ```
 */
export function Callout({ text, title, tone = 'primary', icon, action, className }: CalloutProps) {
  return (
    <div role={tone === 'danger' ? 'alert' : undefined} className={cn('flex gap-3 rounded-md px-4 py-3', SURFACE[tone], className)}>
      <Icon name={icon ?? GLYPH[tone]} className={ACCENT[tone]} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <p className={cn('text-subtitle', ACCENT[tone])}>{title}</p>}
        <div className="text-body text-content-primary">{text}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

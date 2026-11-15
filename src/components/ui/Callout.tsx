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
  /** Compact list or supporting elements shown below the message. */
  items?: ReactNode;
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
export function Callout({ text, title, tone = 'primary', icon, action, items, className }: CalloutProps) {
  return (
    <div role={tone === 'danger' ? 'alert' : undefined} className={cn('flex gap-3 rounded-xl p-4', SURFACE[tone], className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-card">
        <Icon name={icon ?? GLYPH[tone]} className={ACCENT[tone]} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {title && <p className="text-subtitle text-content-primary">{title}</p>}
          {text !== null && text !== undefined && <div className="text-body text-content-secondary">{text}</div>}
          {items && <div className="mt-2 text-body-s text-content-secondary">{items}</div>}
        </div>
        {action && <div className="self-start">{action}</div>}
      </div>
    </div>
  );
}

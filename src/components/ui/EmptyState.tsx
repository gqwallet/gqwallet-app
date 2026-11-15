/**
 * Placeholder for lists or pages without data, loading or failure.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { Bonny } from '@/components/ui/Bonny';

/** Props of {@link EmptyState}. */
export interface EmptyStateProps {
  /** Title. */
  title: string;
  /** Explanation. */
  text?: ReactNode;
  /**
   * Icon ligature.
   *
   * @defaultValue `account_balance_wallet`
   */
  icon?: string;
  /** Action, usually a button. */
  action?: ReactNode;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a centered empty state; failures and restricted access retain their status glyph.
 *
 * @example
 * ```tsx
 * <EmptyState title={title} action={<Button label={actionLabel} icon="add" />} />
 * ```
 */
export function EmptyState({ title, text, icon = 'account_balance_wallet', action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-8 text-center', className)}>
      {icon !== 'error' && icon !== 'lock' ? <Bonny pose="descansa" stage="empty" /> : <span className="flex size-14 items-center justify-center rounded-lg bg-primary-container text-primary-on-container">
        <Icon name={icon} size={24} />
      </span>}
      <p className="text-title text-content-primary">{title}</p>
      {text && <div className="max-w-sm text-body text-content-secondary">{text}</div>}
      {action}
    </div>
  );
}

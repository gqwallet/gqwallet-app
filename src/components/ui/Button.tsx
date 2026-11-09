/**
 * Action button with the five styles of the design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** Visual style of a button. */
export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-surface-inverse text-content-on-primary hover:bg-content-secondary',
  secondary: 'bg-surface-card text-content-primary border border-line-outline hover:bg-surface-container',
  soft: 'bg-primary-container text-primary-on-container hover:bg-primary-pale',
  ghost: 'bg-transparent text-primary-on-container hover:bg-primary-container',
  danger: 'bg-danger text-content-on-primary hover:opacity-90',
};

/** Props of {@link Button}. */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visible text. */
  label: string;
  /**
   * Visual style.
   *
   * @defaultValue `primary`
   */
  variant?: ButtonVariant;
  /** Leading icon ligature. */
  icon?: string;
  /** Shows a busy state and blocks clicks. */
  isLoading?: boolean;
  /** Stretches the button to the container width. */
  isBlock?: boolean;
}

/**
 * Renders a 40 px button; the default style is the primary one.
 *
 * @example
 * ```tsx
 * <Button label="Nuevo movimiento" icon="add" onClick={open} />
 * ```
 */
export function Button({ label, variant = 'primary', icon, isLoading = false, isBlock = false, className, type = 'button', disabled, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-label whitespace-nowrap transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        isBlock && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={isLoading ? 'progress_activity' : icon} className={isLoading ? 'animate-spin' : undefined} />}
      {label}
    </button>
  );
}

/**
 * Square button that only shows an icon.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Icon, type IconSize } from '@/components/ui/Icon';

/** Visual style of an icon button. */
export type IconButtonVariant = 'plain' | 'outline' | 'inverse';

const VARIANT: Record<IconButtonVariant, string> = {
  plain: 'bg-transparent text-content-primary hover:bg-surface-container',
  outline: 'bg-surface-card text-content-primary border border-line-outline hover:bg-surface-container',
  inverse: 'bg-surface-card text-content-primary shadow-floating',
};

/** Props of {@link IconButton}. */
export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Icon ligature. */
  icon: string;
  /** Accessible name. */
  label: string;
  /**
   * Visual style.
   *
   * @defaultValue `plain`
   */
  variant?: IconButtonVariant;
  /**
   * Icon size.
   *
   * @defaultValue 24
   */
  size?: IconSize;
}

/**
 * Renders a 40 px icon-only button with an accessible name.
 *
 * @example
 * ```tsx
 * <IconButton icon="menu" label={menuLabel} onClick={open} />
 * ```
 */
export function IconButton({ icon, label, variant = 'plain', size = 24, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-md transition-colors',
        'focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50',
        variant === 'inverse' && 'rounded-full',
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}

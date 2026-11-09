/**
 * GQWallet logo: inverse mark with the payments glyph and the product name.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui';

/** Props of {@link Brand}. */
export interface BrandProps {
  /** Renders white on dark backgrounds. */
  isInverse?: boolean;
  /** Hides the product name. */
  isMarkOnly?: boolean;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders the product logo.
 *
 * @example
 * ```tsx
 * <Brand />
 * ```
 */
export function Brand({ isInverse = false, isMarkOnly = false, className }: BrandProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('flex size-9 items-center justify-center rounded-md', isInverse ? 'bg-surface-card text-content-primary' : 'bg-surface-inverse text-content-on-primary')}>
        <Icon name="payments" />
      </span>
      {!isMarkOnly && <span className={cn('text-title', isInverse ? 'text-content-on-primary' : 'text-content-primary')}>GQWallet</span>}
    </span>
  );
}

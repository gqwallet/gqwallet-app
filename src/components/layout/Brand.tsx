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
  /** Uses the larger lockup of the public access screens. */
  size?: 'default' | 'large';
}

/**
 * Renders the product logo.
 *
 * @example
 * ```tsx
 * <Brand />
 * ```
 */
export function Brand({ isInverse = false, isMarkOnly = false, className, size = 'default' }: BrandProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('flex items-center justify-center rounded-md', size === 'large' ? 'size-11' : 'size-9', isInverse ? 'bg-surface-card text-content-primary' : 'bg-primary text-content-on-primary')}>
        <Icon name="payments" size={size === 'large' ? 24 : 20} />
      </span>
      {!isMarkOnly && <span className={cn(size === 'large' ? 'text-headline' : 'text-title', isInverse ? 'text-content-on-primary' : 'text-content-primary')}>GQWallet</span>}
    </span>
  );
}

/**
 * GQWallet logo: Bonny's portrait on a banknote with a coin, plus the product name.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import logoMark from '@/assets/brand/logo-mark.png';
import logoMarkDark from '@/assets/brand/logo-mark-dark.png';
import { cn } from '@/utils/cn';

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
 * Renders the product logo; the dark appearance swaps in the mark tuned for dark surfaces.
 *
 * @example
 * ```tsx
 * <Brand />
 * ```
 */
export function Brand({ isInverse = false, isMarkOnly = false, className, size = 'default' }: BrandProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('relative flex shrink-0 items-center justify-center', size === 'large' ? 'h-11 w-14' : 'h-9 w-11')}>
        <img src={logoMark} alt="" aria-hidden="true" className={cn('size-full object-contain', isInverse ? 'hidden' : "[:root[data-theme='dark']_&]:hidden")} />
        <img src={logoMarkDark} alt="" aria-hidden="true" className={cn('size-full object-contain', isInverse ? 'block' : "hidden [:root[data-theme='dark']_&]:block")} />
      </span>
      {!isMarkOnly && <span className={cn(size === 'large' ? 'text-headline' : 'text-title', isInverse ? 'text-content-on-primary' : 'text-content-primary')}>GQWallet</span>}
    </span>
  );
}

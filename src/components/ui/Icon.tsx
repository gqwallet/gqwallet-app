/**
 * Material Symbols Rounded glyph, the icon set of the GQWallet design system.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';

/** Icon sizes of the design system, in pixels. */
export type IconSize = 16 | 20 | 24;

const SIZE: Record<IconSize, string> = { 16: 'text-[16px]', 20: 'text-[20px]', 24: 'text-[24px]' };

/** Props of {@link Icon}. */
export interface IconProps {
  /** Ligature name of the glyph, e.g. `payments`. */
  name: string;
  /**
   * Glyph size.
   *
   * @defaultValue 20
   */
  size?: IconSize;
  /** Layout or color utilities. */
  className?: string;
  /** Accessible label; when absent the icon is decorative. */
  label?: string;
}

/**
 * Renders a design-system icon by ligature.
 *
 * @example
 * ```tsx
 * <Icon name="add" size={20} />
 * ```
 */
export function Icon({ name, size = 20, className, label }: IconProps) {
  return (
    <span
      className={cn('material-symbols-rounded inline-flex shrink-0 select-none leading-none', SIZE[size], className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  );
}

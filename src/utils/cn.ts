/**
 * Class name joiner for conditional Tailwind utilities.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Joins the truthy class names with a space.
 *
 * @param classes - Class names; falsy values are skipped.
 * @returns The joined class string.
 * @example
 * ```ts
 * cn('p-4', isActive && 'bg-primary'); // 'p-4 bg-primary'
 * ```
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

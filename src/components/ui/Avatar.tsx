/**
 * Circle with the initials of the user.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Props of {@link Avatar}. */
export interface AvatarProps {
  /** Initials to show. */
  initials: string;
}

/**
 * Renders a 32 px initials avatar.
 *
 * @example
 * ```tsx
 * <Avatar initials="AT" />
 * ```
 */
export function Avatar({ initials }: AvatarProps) {
  return (
    <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-label text-primary-on-container">
      {initials}
    </span>
  );
}

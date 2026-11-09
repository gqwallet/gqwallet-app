/**
 * Inline navigation link in the primary color.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Link } from 'react-router';
import { cn } from '@/utils/cn';

/** Props of {@link TextLink}. */
export interface TextLinkProps {
  /** Visible text. */
  label: string;
  /** Target path. */
  to: string;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders a router link styled as a ghost action.
 *
 * @example
 * ```tsx
 * <TextLink label={label} to={PATHS.signIn} />
 * ```
 */
export function TextLink({ label, to, className }: TextLinkProps) {
  return (
    <Link to={to} className={cn('inline-flex h-10 items-center rounded-md px-3 text-label text-primary-on-container hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-primary', className)}>
      {label}
    </Link>
  );
}

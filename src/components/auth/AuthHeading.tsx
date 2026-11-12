/**
 * Title at the top of every public form.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Props of {@link AuthHeading}. */
export interface AuthHeadingProps {
  /** Form title. */
  title: string;
}

/**
 * Renders the heading of a public form.
 *
 * @example
 * ```tsx
 * <AuthHeading title={title} />
 * ```
 */
export function AuthHeading({ title }: AuthHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <h1 className="text-headline">{title}</h1>
    </div>
  );
}

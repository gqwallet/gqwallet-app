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
  /** Short instruction shown by the current access-screen design. */
  description?: string;
}

/**
 * Renders the heading of a public form.
 *
 * @example
 * ```tsx
 * <AuthHeading title={title} />
 * ```
 */
export function AuthHeading({ title, description }: AuthHeadingProps) {
  return (
    <div className="mb-5 flex flex-col gap-5">
      <h1 className="text-headline">{title}</h1>
      {description && <p className="hidden text-body text-content-secondary lg:block">{description}</p>}
    </div>
  );
}

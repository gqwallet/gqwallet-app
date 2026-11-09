/**
 * Title and description at the top of every public form.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/** Props of {@link AuthHeading}. */
export interface AuthHeadingProps {
  /** Form title. */
  title: string;
  /** Short explanation. */
  description: string;
}

/**
 * Renders the heading of a public form.
 *
 * @example
 * ```tsx
 * <AuthHeading title={title} description={description} />
 * ```
 */
export function AuthHeading({ title, description }: AuthHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <h1 className="text-headline">{title}</h1>
      <p className="text-body text-content-secondary">{description}</p>
    </div>
  );
}

/**
 * Loading indicator.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Icon } from '@/components/ui/Icon';

/** Props of {@link Spinner}. */
export interface SpinnerProps {
  /**
   * Accessible text.
   *
   * @defaultValue `Cargando…`
   */
  label?: string;
}

/**
 * Renders a centered spinning icon with a live label.
 *
 * @example
 * ```tsx
 * {isLoading && <Spinner />}
 * ```
 */
export function Spinner({ label = 'Cargando…' }: SpinnerProps) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-content-muted">
      <Icon name="progress_activity" size={24} className="animate-spin" />
      <span className="text-body">{label}</span>
    </div>
  );
}

/**
 * Floating confirmation or error message.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

/** Tone of a toast. */
export type ToastTone = 'success' | 'danger';

const BOX: Record<ToastTone, string> = { success: 'bg-secondary-container text-secondary', danger: 'bg-danger-container text-danger' };
const GLYPH: Record<ToastTone, string> = { success: 'check_circle', danger: 'error' };

/** Props of {@link Toast}. */
export interface ToastProps {
  /** Title. */
  title: string;
  /** Detail text. */
  detail?: string;
  /**
   * Tone.
   *
   * @defaultValue `success`
   */
  tone?: ToastTone;
  /** Called when the user dismisses the toast. */
  onDismiss?: () => void;
}

/**
 * Renders a dark toast with a tinted icon box.
 *
 * @example
 * ```tsx
 * <Toast title={title} detail={detail} />
 * ```
 */
export function Toast({ title, detail, tone = 'success', onDismiss }: ToastProps) {
  return (
    <div role="status" aria-live="polite" className="flex w-full max-w-[400px] items-center gap-3 rounded-lg bg-surface-inverse px-4 py-3.5 shadow-floating">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', BOX[tone])}>
        <Icon name={GLYPH[tone]} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-subtitle text-content-on-primary">{title}</p>
        {detail && <p className="text-body-s text-content-on-primary opacity-80">{detail}</p>}
      </div>
      {onDismiss && (
        <button type="button" aria-label="Cerrar aviso" onClick={onDismiss} className="text-content-on-primary opacity-80 hover:opacity-100">
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}

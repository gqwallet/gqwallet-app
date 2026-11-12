/**
 * Dialog shown as a bottom sheet on small screens and centered on large ones.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';

/** Props of {@link Modal}. */
export interface ModalProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Dialog title. */
  title: string;
  /** Text below the title. */
  description?: ReactNode;
  /** Dialog content. */
  children?: ReactNode;
  /** Buttons at the bottom. */
  footer?: ReactNode;
  /** Called on Escape, backdrop click or the close button. */
  onClose: () => void;
  /** Icon ligature shown in a tinted box next to the title. */
  icon?: string;
  /** Wider dialog for forms. */
  isWide?: boolean;
  /** Keeps short form actions inline using the reference form dimensions. */
  isInlineForm?: boolean;
  /** Uses the compact information-panel design. */
  isInformation?: boolean;
}

/**
 * Renders an accessible modal dialog over a scrim; Escape closes it and focus moves inside.
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} title="Anular movimiento" onClose={close} footer={<Button label="Anular" variant="danger" />} />
 * ```
 */
export function Modal({ isOpen, title, description, children, footer, onClose, icon, isWide = false, isInformation = false, isInlineForm = false }: ModalProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const items = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
        const first = items?.[0]; const last = items?.[items.length - 1];
        if (first && last && (event.shiftKey ? document.activeElement === first || document.activeElement === panel.current : document.activeElement === last || document.activeElement === panel.current)) {
          event.preventDefault(); (event.shiftKey ? last : first).focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    panel.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-end justify-center ${isInformation ? 'bg-information-scrim' : 'bg-scrim'} lg:items-center lg:p-6`} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'flex max-h-[90vh] w-full flex-col gap-4 overflow-y-auto bg-surface-card shadow-floating outline-none',
          isInformation ? 'gap-5 rounded-information p-6 lg:max-w-information' : isInlineForm ? 'rounded-t-xl p-4 pb-7 lg:rounded-xl lg:p-6' : 'rounded-t-xl p-5 lg:rounded-xl lg:p-6',
          isInlineForm ? 'lg:max-w-inline-form' : isInformation ? '' : isWide ? 'lg:max-w-[560px]' : 'lg:max-w-[440px]',
        )}
      >
        <header className="flex items-start gap-3">
          {icon && (
            <span className={cn('flex shrink-0 items-center justify-center rounded-md bg-primary-container text-primary-on-container', isInlineForm ? 'size-11' : 'size-9')}>
              <Icon name={icon} />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 id={titleId} className="text-title">
              {title}
            </h2>
            {description && <div className="text-body text-content-secondary">{description}</div>}
          </div>
          {!isInformation && <IconButton icon="close" label="Cerrar" size={20} onClick={onClose} className="-mt-2 -mr-2" />}
        </header>
        {children}
        {footer && <footer className={cn('flex lg:justify-end', isInlineForm ? 'flex-row gap-3' : 'flex-col-reverse gap-2 lg:flex-row')}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

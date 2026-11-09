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
}

/**
 * Renders an accessible modal dialog over a scrim; Escape closes it and focus moves inside.
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} title="Anular movimiento" onClose={close} footer={<Button label="Anular" variant="danger" />} />
 * ```
 */
export function Modal({ isOpen, title, description, children, footer, onClose, icon, isWide = false }: ModalProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    panel.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-scrim lg:items-center lg:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'flex max-h-[90vh] w-full flex-col gap-4 overflow-y-auto rounded-t-xl bg-surface-card p-5 shadow-floating outline-none lg:rounded-xl lg:p-6',
          isWide ? 'lg:max-w-[560px]' : 'lg:max-w-[440px]',
        )}
      >
        <header className="flex items-start gap-3">
          {icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-container text-primary-on-container">
              <Icon name={icon} />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 id={titleId} className="text-title">
              {title}
            </h2>
            {description && <div className="text-body text-content-secondary">{description}</div>}
          </div>
          <IconButton icon="close" label="Cerrar" size={20} onClick={onClose} className="-mt-2 -mr-2" />
        </header>
        {children}
        {footer && <footer className="flex flex-col-reverse gap-2 lg:flex-row lg:justify-end">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

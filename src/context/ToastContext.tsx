/**
 * Global confirmation messages that survive navigation (e.g. after saving and going back).
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Toast, type ToastTone } from '@/components/ui';

/** Message queued for display. */
export interface ToastMessage {
  /** Title. */
  title: string;
  /** Detail text. */
  detail?: string;
  /** Tone. */
  tone?: ToastTone;
}

/** Value exposed by {@link ToastProvider}. */
export interface ToastContextValue {
  /** Shows a message for a few seconds. */
  notify: (message: ToastMessage) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const DURATION_MS = 4500;

/** Props of {@link ToastProvider}. */
export interface ToastProviderProps {
  /** App tree. */
  children: ReactNode;
}

/**
 * Provides `notify` and renders the active toast at the bottom of the screen.
 *
 * @example
 * ```tsx
 * <ToastProvider><App /></ToastProvider>
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((next: ToastMessage) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(null), DURATION_MS);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 lg:bottom-8 [&>*]:pointer-events-auto">
          <Toast title={message.title} detail={message.detail} tone={message.tone} onDismiss={() => setMessage(null)} />
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Reads the toast API.
 *
 * @returns The `notify` action.
 * @throws Error When used outside {@link ToastProvider}.
 * @example
 * ```ts
 * const { notify } = useToast();
 * ```
 */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}

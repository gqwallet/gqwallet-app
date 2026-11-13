/**
 * Public layout: dark value-proposition panel on large screens and a centered form column.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import moneyMark from '@/assets/auth/desktop-imgMoneyMark1.svg';
import { Icon } from '@/components/ui';
import { Brand } from '@/components/layout/Brand';
import { MoneyPattern } from '@/components/layout/MoneyPattern';

const BENEFITS = [
  'Registra ingresos y gastos en PEN y USD, sin mezclarlos.',
  'Controla tarjetas, pagos fijos y presupuestos en un solo lugar.',
  'Mira cuánto tienes disponible hoy y cómo cerrará tu año.',
];

const HEADLINE = 'Toma el control de tus finanzas, sin conectar tus bancos.';

/** Props of {@link AuthLayout}. */
export interface AuthLayoutProps {
  /** Form or welcome content. */
  children: ReactNode;
  /** Shows the value proposition on the mobile welcome screen. */
  showMobileHeadline?: boolean;
}

/**
 * Renders the welcome, sign-up, sign-in and onboarding frame.
 *
 * @example
 * ```tsx
 * <AuthLayout><SignInForm /></AuthLayout>
 * ```
 */
export function AuthLayout({ children, showMobileHeadline = false }: AuthLayoutProps) {
  return (
    <div className="relative isolate min-h-screen lg:grid lg:grid-cols-[640px_1fr]">
      <MoneyPattern />
      <aside className="relative hidden flex-col justify-center gap-6 overflow-hidden bg-surface-inverse px-16 text-content-on-primary lg:flex">
        <Brand isInverse size="large" />
        <p className="text-display">{HEADLINE}</p>
        <ul className="flex flex-col gap-6">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-body">
              <Icon name="check_circle" />
              {benefit}
            </li>
          ))}
        </ul>
        <span aria-hidden="true" className="absolute top-[600px] left-[332.1px] flex h-[255.986px] w-[304.059px] items-center justify-center"><img src={moneyMark} alt="" className="block max-w-none shrink-0 rotate-14" /></span>
      </aside>
      <main className="flex min-h-screen flex-col px-4 pt-8 pb-10 lg:items-center lg:justify-center lg:px-10">
        <div className="mb-5 flex flex-col gap-5 lg:hidden">
          <Brand />
          {showMobileHeadline && <p className="text-headline">{HEADLINE}</p>}
        </div>
        <div className="w-full lg:max-w-[400px] lg:translate-y-1.5">{children}</div>
      </main>
    </div>
  );
}

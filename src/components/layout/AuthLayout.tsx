/**
 * Public layout: dark value-proposition panel on large screens and a centered form column.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import moneyMark from '@/assets/money-mark.svg';
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
}

/**
 * Renders the welcome, sign-up, sign-in and onboarding frame.
 *
 * @example
 * ```tsx
 * <AuthLayout><SignInForm /></AuthLayout>
 * ```
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative isolate min-h-screen lg:grid lg:grid-cols-[640px_1fr]">
      <MoneyPattern />
      <aside className="relative hidden flex-col justify-center gap-6 overflow-hidden bg-surface-inverse px-16 text-content-on-primary lg:flex">
        <Brand isInverse />
        <p className="max-w-[480px] text-[28px] leading-[34px] font-bold tracking-[-0.4px]">{HEADLINE}</p>
        <ul className="flex flex-col gap-4">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-body">
              <Icon name="check_circle" />
              {benefit}
            </li>
          ))}
        </ul>
        <img src={moneyMark} alt="" aria-hidden="true" className="absolute top-[64%] left-[54%] w-[200px] -rotate-6 opacity-20 invert" />
      </aside>
      <main className="flex min-h-screen flex-col px-4 pt-6 pb-10 lg:items-center lg:justify-center lg:px-10">
        <div className="mb-6 flex flex-col gap-4 lg:hidden">
          <Brand />
          <p className="text-[22px] leading-[28px] font-bold">{HEADLINE}</p>
        </div>
        <div className="w-full lg:max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}

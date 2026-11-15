/**
 * Public layout with a light brand stage and an elevated desktop form.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { Bonny, Icon } from '@/components/ui';
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
  /** Access screens show the mascot; initial setup retains its compact form. */
  showMascot?: boolean;
  /** Access pose matching the current form. */
  pose?: 'regia' | 'celebra';
}

/**
 * Renders the welcome, sign-up, sign-in and onboarding frame.
 *
 * @example
 * ```tsx
 * <AuthLayout><SignInForm /></AuthLayout>
 * ```
 */
export function AuthLayout({ children, showMobileHeadline = false, showMascot = true, pose = 'regia' }: AuthLayoutProps) {
  return (
    <div className="relative isolate min-h-screen lg:grid lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
      <MoneyPattern />
      <aside className="relative flex flex-col gap-5 overflow-hidden px-4 pt-8 lg:m-6 lg:mr-0 lg:min-h-[852px] lg:justify-center lg:gap-6 lg:rounded-brand lg:border lg:border-line-subtle lg:bg-linear-[118deg] lg:from-primary-container lg:to-chart-4-container lg:px-16 lg:py-14">
        <div className="lg:hidden"><Brand /></div>
        <div className="hidden lg:block"><Brand size="large" /></div>
        {showMascot && <div className="relative h-[148px] overflow-hidden rounded-2xl bg-linear-to-r from-accent-container to-chart-4-container lg:absolute lg:right-10 lg:bottom-0 lg:h-[294px] lg:w-[300px] lg:rounded-none lg:bg-none">
          <Bonny pose={pose} stage="access" />
        </div>}
        <p className={showMobileHeadline ? 'text-headline lg:text-display' : 'hidden text-display lg:block'}>{HEADLINE}</p>
        <ul className="hidden flex-col gap-6 lg:flex">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-body text-content-secondary">
              <Icon name="check_circle" className="text-primary" />
              {benefit}
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex flex-col px-4 pt-5 pb-10 lg:min-h-screen lg:items-center lg:justify-center lg:px-10 lg:pt-10 lg:pl-16">
        <div className="w-full lg:max-w-[480px] lg:rounded-2xl lg:border lg:border-line-subtle lg:bg-surface-card lg:p-10 lg:shadow-card">{children}</div>
      </main>
    </div>
  );
}

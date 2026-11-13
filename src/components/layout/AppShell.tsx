/**
 * Authenticated layout: fixed sidebar on large screens, header and drawer menu on small ones.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { IconButton } from '@/components/ui';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Sidebar, type SidebarProps } from '@/components/layout/Sidebar';

/** Props of {@link AppShell}. */
export interface AppShellProps extends Omit<SidebarProps, 'onNavigate' | 'className'> {
  /** Title shown in the mobile header. */
  title: string;
  /** Page content. */
  children: ReactNode;
}

/**
 * Renders the shell around every authenticated page.
 *
 * @example
 * ```tsx
 * <AppShell title="Dashboard" sections={USER_NAVIGATION} {...user} onSignOut={signOut}>…</AppShell>
 * ```
 */
export function AppShell({ title, children, ...sidebar }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleKey = (event: KeyboardEvent) => event.key === 'Escape' && setIsMenuOpen(false);
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isMenuOpen]);

  return (
    <div className="relative isolate min-h-screen lg:flex">
      <Sidebar {...sidebar} className="sticky top-0 hidden h-screen shrink-0 lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader informationTopic={({ "/dashboard": "Dashboard", "/movimientos": "Movimientos", "/cuentas": "Cuentas", "/tarjetas": "Tarjetas", "/pagos-fijos": "Pagos fijos", "/presupuesto": "Presupuesto", "/flujo-de-caja": "Flujo de caja", "/metas": "Metas", "/reportes": "Reportes", "/calendario": "Calendario" } as Record<string, string>)[location.pathname]} title={title} onOpenMenu={() => setIsMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1192px] flex-1 px-4 pt-4 pb-10 lg:px-10 lg:pt-8">{children}</main>
      </div>
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-scrim lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <Sidebar {...sidebar} onNavigate={() => setIsMenuOpen(false)} className="h-full w-[300px] shadow-floating" />
          <IconButton icon="close" label="Cerrar menú" variant="inverse" size={20} onClick={() => setIsMenuOpen(false)} className="absolute top-2 right-3" />
        </div>
      )}
    </div>
  );
}

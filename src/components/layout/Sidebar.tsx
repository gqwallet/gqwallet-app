/**
 * Navigation panel with grouped links and the user footer.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { NavLink } from 'react-router';
import { cn } from '@/utils/cn';
import { Avatar, Icon, Overline } from '@/components/ui';
import { Brand } from '@/components/layout/Brand';
import { PATHS } from '@/navigation/paths';

/** One navigation link. */
export interface NavEntry {
  /** Visible text. */
  label: string;
  /** Icon ligature. */
  icon: string;
  /** Target path. */
  to: string;
}

/** Group of navigation links under an overline. */
export interface NavSection {
  /** Group title. */
  title: string;
  /** Links. */
  items: NavEntry[];
}

/** Navigation of a registered user, as in the Sidebar `Role=User` variant. */
export const USER_NAVIGATION: NavSection[] = [
  {
    title: 'General',
    items: [
      { label: 'Dashboard', icon: 'space_dashboard', to: PATHS.dashboard },
      { label: 'Movimientos', icon: 'swap_vert', to: PATHS.transactions },
      { label: 'Cuentas', icon: 'account_balance', to: PATHS.accounts },
      { label: 'Tarjetas', icon: 'credit_card', to: PATHS.cards },
      { label: 'Pagos fijos', icon: 'event_repeat', to: PATHS.fixedPayments },
      { label: 'Presupuesto', icon: 'pie_chart', to: PATHS.budget },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { label: 'Flujo de caja', icon: 'monitoring', to: PATHS.cashFlow },
      { label: 'Metas', icon: 'savings', to: PATHS.goals },
      { label: 'Reportes', icon: 'bar_chart', to: PATHS.reports },
      { label: 'Calendario', icon: 'calendar_month', to: PATHS.calendar },
    ],
  },
  {
    title: 'Ajustes',
    items: [
      { label: 'Categorías', icon: 'sell', to: PATHS.categories },
      { label: 'Exportar', icon: 'download', to: PATHS.exports },
      { label: 'Perfil', icon: 'person', to: PATHS.profile },
    ],
  },
];

/** Navigation of an administrator, as in the Sidebar `Role=Admin` variant. */
export const ADMIN_NAVIGATION: NavSection[] = [
  { title: 'Administración', items: [{ label: 'Métricas', icon: 'insights', to: PATHS.metrics }] },
];

/** Props of {@link Sidebar}. */
export interface SidebarProps {
  /** Link groups. */
  sections: NavSection[];
  /** Full name shown in the footer. */
  userName: string;
  /** Second line of the footer: email or role. */
  userDetail: string;
  /** Initials of the avatar. */
  userInitials: string;
  /** Called when the user signs out. */
  onSignOut: () => void;
  /** Called after a link is followed, to close the mobile drawer. */
  onNavigate?: () => void;
  /** Layout utilities. */
  className?: string;
}

/**
 * Renders the 248 px sidebar; the active link uses the primary container.
 *
 * @example
 * ```tsx
 * <Sidebar sections={USER_NAVIGATION} userName="Ana Torres" userDetail="ana@correo.pe" userInitials="AT" onSignOut={signOut} />
 * ```
 */
export function Sidebar({ sections, userName, userDetail, userInitials, onSignOut, onNavigate, className }: SidebarProps) {
  return (
    <nav aria-label="Menú principal" className={cn('flex h-full w-[248px] flex-col gap-1 overflow-y-auto border-r border-line-subtle bg-surface-card px-4 py-5', className)}>
      <Brand className="mb-3" />
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <Overline label={section.title} className="px-3 pt-3 pb-1.5" />
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex h-9 items-center gap-3 rounded-md px-3 transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                  isActive ? 'bg-primary-container text-subtitle text-primary-on-container' : 'text-body text-content-secondary hover:bg-surface-container',
                )
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="flex-1" />
      <div className="flex flex-col gap-3 border-t border-line-subtle pt-4">
        <div className="flex items-center gap-3 px-3">
          <Avatar initials={userInitials} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-subtitle">{userName}</span>
            <span className="truncate text-caption text-content-muted">{userDetail}</span>
          </div>
        </div>
        <button type="button" onClick={onSignOut} className="flex h-9 items-center gap-3 rounded-md px-3 text-label text-primary-on-container hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-primary">
          <Icon name="logout" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

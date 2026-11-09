/**
 * Route guards: public-only, authenticated and administrator routes.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AppShell, ADMIN_NAVIGATION, Spinner, USER_NAVIGATION } from '@/navigation/shell';
import { initials } from '@/utils/format';
import { PATHS } from '@/navigation/paths';
import { titleFor } from '@/navigation/titles';

/**
 * Lets only anonymous visitors through; signed-in users go to their home.
 *
 * @example
 * ```tsx
 * <Route element={<PublicOnly />}>…</Route>
 * ```
 */
export function PublicOnly() {
  const { status, isAdmin, isNewUser } = useAuth();
  if (status === 'checking') return <Spinner />;
  if (status === 'authenticated') return <Navigate to={isNewUser ? PATHS.onboarding : isAdmin ? PATHS.metrics : PATHS.dashboard} replace />;
  return <Outlet />;
}

/**
 * Requires a session; without it the visitor goes to sign-in.
 *
 * @example
 * ```tsx
 * <Route element={<RequireAuth />}>…</Route>
 * ```
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <Spinner />;
  if (status === 'anonymous') return <Navigate to={PATHS.signIn} replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/**
 * Wraps authenticated pages in the shell with the navigation of the user role.
 *
 * @example
 * ```tsx
 * <Route element={<ShellLayout />}>…</Route>
 * ```
 */
export function ShellLayout() {
  const { profile, user, isAdmin, signOut } = useAuth();
  const { notify } = useToast();
  const location = useLocation();
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
  const name = isAdmin ? 'Equipo GQWallet' : fullName || user?.email || 'Mi cuenta';
  if (isAdmin && location.pathname !== PATHS.metrics) return <Navigate to={PATHS.metrics} replace />;
  const handleSignOut = () => {
    void signOut().then(() => notify({ title: 'Sesión cerrada', detail: 'Vuelve cuando quieras.' }));
  };
  return (
    <AppShell
      title={titleFor(location.pathname)}
      sections={isAdmin ? ADMIN_NAVIGATION : USER_NAVIGATION}
      userName={name}
      userDetail={isAdmin ? 'Administrador' : user?.email ?? ''}
      userInitials={isAdmin ? 'AD' : initials(fullName || user?.email || 'GQ')}
      onSignOut={handleSignOut}
    >
      <Outlet />
    </AppShell>
  );
}

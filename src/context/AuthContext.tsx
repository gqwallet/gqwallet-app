/**
 * Session state shared by the router guards and the shell: signed-in profile and roles.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { profilesService } from '@/services/profiles.service';
import type { Profile } from '@/types/profile';
import type { AuthenticatedUser } from '@/types/auth';

/** Session status while the cookie is being probed. */
export type SessionStatus = 'checking' | 'authenticated' | 'anonymous';

/** Value exposed by {@link AuthProvider}. */
export interface AuthContextValue {
  /** Session status. */
  status: SessionStatus;
  /** Signed-in user identity (email and roles), when known. */
  user: AuthenticatedUser | null;
  /** Profile of the signed-in user. */
  profile: Profile | null;
  /** Whether the user is an administrator. */
  isAdmin: boolean;
  /** Whether the session belongs to a user who just signed up and has not finished the setup. */
  isNewUser: boolean;
  /** Stores the identity returned by sign-in or sign-up and loads the profile. */
  startSession: (user: AuthenticatedUser, isNew?: boolean) => Promise<void>;
  /** Marks the initial setup as finished or skipped. */
  finishSetup: () => void;
  /** Replaces the cached profile after an update. */
  setProfile: (profile: Profile) => void;
  /** Signs out and clears the session. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const EMAIL_KEY = 'gqwallet.email';

function rememberEmail(email: string | null) {
  try {
    if (email) sessionStorage.setItem(EMAIL_KEY, email);
    else sessionStorage.removeItem(EMAIL_KEY);
  } catch {
    // Storage may be blocked; the email is only a display convenience.
  }
}

function recallEmail(): string {
  try {
    return sessionStorage.getItem(EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Props of {@link AuthProvider}. */
export interface AuthProviderProps {
  /** App tree. */
  children: ReactNode;
}

/**
 * Probes the httpOnly session cookie through `GET /profiles/me` and provides the session.
 *
 * @example
 * ```tsx
 * <AuthProvider><App /></AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<SessionStatus>('checking');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    profilesService
      .getMine(controller.signal)
      .then((loaded) => {
        setProfile(loaded);
        setUser({ id: loaded.id, email: recallEmail(), roles: loaded.roles });
        setStatus('authenticated');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('anonymous');
      });
    return () => controller.abort();
  }, []);

  const startSession = useCallback(async (signedIn: AuthenticatedUser, isNew = false) => {
    rememberEmail(signedIn.email);
    setIsNewUser(isNew);
    setUser(signedIn);
    try {
      setProfile(await profilesService.getMine());
    } catch {
      setProfile(null);
    }
    setStatus('authenticated');
  }, []);

  const finishSetup = useCallback(() => setIsNewUser(false), []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } finally {
      rememberEmail(null);
      setUser(null);
      setProfile(null);
      setStatus('anonymous');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile,
      isAdmin: (user?.roles ?? profile?.roles ?? []).includes('ADMINISTRATOR'),
      isNewUser,
      startSession,
      finishSetup,
      setProfile,
      signOut,
    }),
    [status, user, profile, isNewUser, startSession, finishSetup, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Reads the session.
 *
 * @returns The session value.
 * @throws Error When used outside {@link AuthProvider}.
 * @example
 * ```ts
 * const { profile, signOut } = useAuth();
 * ```
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

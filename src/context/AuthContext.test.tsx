/**
 * Tests of cookie probing, session transitions, roles and provider requirements.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { profilesService } from '@/services/profiles.service';
import type { Profile } from '@/types/profile';

vi.mock('@/services/auth.service', () => ({ authService: { signOut: vi.fn() } }));
vi.mock('@/services/profiles.service', () => ({ profilesService: { getMine: vi.fn() } }));
const profile: Profile = { id: 'p1', firstName: 'Ana', lastName: 'Torres', preferredCurrency: 'PEN', monthlyIncome: null, lifeCushion: null, birthDate: null, debtLoadThreshold: 7, countryCode: 'PE', roles: ['REGISTERED_USER'] };
const user = { id: 'p1', email: 'ana@correo.pe', roles: ['REGISTERED_USER'] } as const;
function wrapper({ children }: { children: ReactNode }) { return <AuthProvider>{children}</AuthProvider>; }
beforeEach(() => {
  vi.resetAllMocks();
  sessionStorage.clear();
  vi.mocked(profilesService.getMine).mockResolvedValue(profile);
});

it('starts checking and restores the cookie session, display email and admin role', async () => {
  sessionStorage.setItem('gqwallet.email', user.email);
  vi.mocked(profilesService.getMine).mockResolvedValue({ ...profile, roles: ['ADMINISTRATOR'] });
  const { result } = renderHook(useAuth, { wrapper });
  expect(result.current.status).toBe('checking');
  expect(result.current.user).toBeNull();
  await waitFor(() => expect(result.current.status).toBe('authenticated'));
  expect(result.current.user?.email).toBe(user.email);
  expect(result.current.isAdmin).toBe(true);
  expect(result.current.profile?.id).toBe('p1');
});

it('becomes anonymous after a rejected cookie probe', async () => {
  vi.mocked(profilesService.getMine).mockRejectedValue(new Error('No session'));
  const { result } = renderHook(useAuth, { wrapper });
  await waitFor(() => expect(result.current.status).toBe('anonymous'));
  expect(result.current.profile).toBeNull();
  expect(result.current.isAdmin).toBe(false);
});

it('aborts an outstanding cookie probe on unmount', () => {
  vi.mocked(profilesService.getMine).mockReturnValue(new Promise(() => undefined));
  const { unmount } = renderHook(useAuth, { wrapper });
  const signal = vi.mocked(profilesService.getMine).mock.calls[0][0];
  expect(signal?.aborted).toBe(false);
  unmount();
  expect(signal?.aborted).toBe(true);
});

it('starts a new session, refreshes the profile, finishes setup and accepts profile updates', async () => {
  vi.mocked(profilesService.getMine).mockRejectedValueOnce(new Error('No session'));
  const { result } = renderHook(useAuth, { wrapper });
  await waitFor(() => expect(result.current.status).toBe('anonymous'));
  await act(async () => { await result.current.startSession({ ...user, roles: [...user.roles] }, true); });
  expect(result.current.status).toBe('authenticated');
  expect(result.current.isNewUser).toBe(true);
  expect(result.current.profile).toEqual(profile);
  expect(sessionStorage.getItem('gqwallet.email')).toBe(user.email);
  act(() => { result.current.finishSetup(); result.current.setProfile({ ...profile, firstName: 'María' }); });
  expect(result.current.isNewUser).toBe(false);
  expect(result.current.profile?.firstName).toBe('María');
});

it('keeps the signed-in identity if loading its profile fails', async () => {
  vi.mocked(profilesService.getMine).mockRejectedValue(new Error('Unavailable'));
  const { result } = renderHook(useAuth, { wrapper });
  await waitFor(() => expect(result.current.status).toBe('anonymous'));
  await act(async () => { await result.current.startSession({ ...user, roles: [...user.roles] }); });
  expect(result.current.status).toBe('authenticated');
  expect(result.current.user?.email).toBe(user.email);
  expect(result.current.profile).toBeNull();
});

it.each([false, true])('clears local session on sign-out even when the request fails: %s', async (fails) => {
  sessionStorage.setItem('gqwallet.email', user.email);
  if (fails) vi.mocked(authService.signOut).mockRejectedValue(new Error('Offline'));
  const { result } = renderHook(useAuth, { wrapper });
  await waitFor(() => expect(result.current.status).toBe('authenticated'));
  await act(async () => {
    if (fails) await expect(result.current.signOut()).rejects.toThrow('Offline');
    else await result.current.signOut();
  });
  expect(authService.signOut).toHaveBeenCalledOnce();
  expect(result.current.status).toBe('anonymous');
  expect(result.current.user).toBeNull();
  expect(result.current.profile).toBeNull();
  expect(sessionStorage.getItem('gqwallet.email')).toBeNull();
});

it('requires its provider', () => {
  expect(() => renderHook(useAuth)).toThrow('useAuth must be used inside AuthProvider');
});


it('clears the profile and identity when an existing request expires the session', async () => {
  const { sessionEvents } = await import('@/services/session-events');
  const { result } = renderHook(useAuth, { wrapper });
  await waitFor(() => expect(result.current.status).toBe('authenticated'));
  act(() => sessionEvents.expire(sessionEvents.current()));
  expect(result.current.status).toBe('anonymous');
  expect(result.current.sessionExpired).toBe(true);
  expect(result.current.user).toBeNull();
  expect(result.current.profile).toBeNull();
  expect(authService.signOut).not.toHaveBeenCalled();
  await act(async () => result.current.startSession({ ...user, roles: ['REGISTERED_USER'] }));
  expect(result.current.status).toBe('authenticated');
  expect(result.current.sessionExpired).toBe(false);
});

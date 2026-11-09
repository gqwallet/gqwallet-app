/**
 * Tests of the sign-in and sign-up hooks.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const setProfile = vi.fn();
const startSession = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'ana@correo.pe', roles: [] }, profile: { id: 'p1', firstName: 'Ana', lastName: null, preferredCurrency: 'PEN', monthlyIncome: null, lifeCushion: null, roles: [] }, setProfile, startSession, isAdmin: false }),
}));
vi.mock('@/services/auth.service', () => ({ authService: { signIn: vi.fn(() => Promise.resolve({ id: 'u1', email: 'a@b.pe', roles: ['REGISTERED_USER'] })), signUp: vi.fn(async () => { const { ApiError } = await import('@/types/api'); throw new ApiError(409); }) } }));
import { useSignIn, useSignUp } from '@/hooks/useAuthActions';

beforeEach(() => vi.clearAllMocks());

describe('useAuthActions', () => {
  it('starts the session after signing in', async () => {
    const { result } = renderHook(() => useSignIn());
    await act(async () => { await result.current.signIn({ email: 'a@b.pe', password: 'x' }); });
    expect(startSession).toHaveBeenCalled();
  });
  it('maps a conflict to the duplicated email message', async () => {
    const { result } = renderHook(() => useSignUp());
    await act(async () => { await result.current.signUp({ email: 'a@b.pe', password: 'abc12345', consentAccepted: true }); });
    expect(result.current.errors.email).toMatch(/Ya existe una cuenta/);
  });
  it('opens the session with the sign-up response alone, without calling sign-in', async () => {
    const { authService } = await import('@/services/auth.service');
    vi.mocked(authService.signUp).mockResolvedValueOnce({ id: 'u2', email: 'n@b.pe', roles: ['REGISTERED_USER'] });
    vi.mocked(authService.signIn).mockClear();
    const { result } = renderHook(() => useSignUp());
    await act(async () => { await result.current.signUp({ email: 'n@b.pe', password: 'abc12345', consentAccepted: true }); });
    expect(authService.signIn).not.toHaveBeenCalled();
    expect(startSession).toHaveBeenCalledWith({ id: 'u2', email: 'n@b.pe', roles: ['REGISTERED_USER'] }, true);
  });
});

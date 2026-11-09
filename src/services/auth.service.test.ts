/**
 * Tests of the authentication service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/services/api-client';

vi.mock('@/services/api-client', () => ({
  apiClient: { get: vi.fn().mockResolvedValue([]), post: vi.fn().mockResolvedValue({}), put: vi.fn().mockResolvedValue({}), delete: vi.fn().mockResolvedValue(undefined) },
}));

beforeEach(() => vi.clearAllMocks());
import { authService } from '@/services/auth.service';

describe('authService', () => {
  it('calls POST for signUp', async () => {
    await authService.signUp({ email: 'a@b.pe', password: 'abc12345', consentAccepted: true });
    expect(apiClient.post).toHaveBeenCalledWith('/authentication/sign-up', { email: 'a@b.pe', password: 'abc12345', consentAccepted: true });
  });
  it('calls POST for signIn', async () => {
    await authService.signIn({ email: 'a@b.pe', password: 'x' });
    expect(apiClient.post).toHaveBeenCalledWith('/authentication/sign-in', { email: 'a@b.pe', password: 'x' });
  });
  it('calls POST for signOut', async () => {
    await authService.signOut();
    expect(apiClient.post).toHaveBeenCalledWith('/authentication/sign-out');
  });
});

/**
 * Tests of the Google consent URL builder.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { googleConsentUrl } from '@/services/googleAuth';

afterEach(() => vi.unstubAllEnvs());

describe('googleConsentUrl', () => {
  it('returns null without a client id', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    expect(googleConsentUrl('http://localhost:5173')).toBeNull();
  });
  it('requests offline calendar access with the callback path', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client');
    const url = new URL(googleConsentUrl('http://localhost:5173') ?? '');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:5173/calendario/conexion');
    expect(url.searchParams.get('access_type')).toBe('offline');
  });
});

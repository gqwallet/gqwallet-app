/**
 * Tests of the profile-backed debt threshold hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebtThreshold } from '@/hooks/useDebtThreshold';
import { profilesService } from '@/services/profiles.service';
import type { Profile } from '@/types/profile';
import { ApiError } from '@/types/api';

const { session } = vi.hoisted(() => ({ session: { profile: null as Profile | null, setProfile: vi.fn<(profile: Profile) => void>() } }));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => session }));
vi.mock('@/services/profiles.service', () => ({ profilesService: { updateMine: vi.fn() } }));

beforeEach(() => {
  vi.resetAllMocks();
  session.profile = { id: 'p1', firstName: 'Ana', lastName: 'Torres', preferredCurrency: 'PEN', monthlyIncome: 100, lifeCushion: 10, birthDate: '1995-03-14', debtLoadThreshold: 12.5, countryCode: 'PE', roles: [] };
  session.setProfile.mockImplementation((profile) => { session.profile = profile; });
});

describe('useDebtThreshold', () => {
  it('reads the server value and persists updates with the rest of the profile intact', async () => {
    const updated = { ...session.profile!, debtLoadThreshold: 15 };
    vi.mocked(profilesService.updateMine).mockResolvedValue(updated);
    const { result, rerender } = renderHook(() => useDebtThreshold());
    expect(result.current.threshold).toBe(12.5);
    await act(async () => expect(await result.current.setThreshold(15)).toBe(true));
    expect(profilesService.updateMine).toHaveBeenCalledWith({ firstName: 'Ana', lastName: 'Torres', preferredCurrency: 'PEN', monthlyIncome: 100, lifeCushion: 10, birthDate: '1995-03-14', debtLoadThreshold: 15 });
    rerender();
    expect(result.current.threshold).toBe(15);
    expect(renderHook(() => useDebtThreshold()).result.current.threshold).toBe(15);
  });

  it('preserves the previous percentage after a rejected save', async () => {
    vi.mocked(profilesService.updateMine).mockRejectedValue(new ApiError(422));
    const { result } = renderHook(() => useDebtThreshold());
    await act(async () => expect(await result.current.setThreshold(20)).toBe(false));
    expect(result.current.threshold).toBe(12.5);
    expect(session.setProfile).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });

  it.each([0, 0.001, 101, NaN])('rejects invalid threshold %s', async (value) => {
    const { result } = renderHook(() => useDebtThreshold());
    await act(async () => expect(await result.current.setThreshold(value)).toBe(false));
    expect(profilesService.updateMine).not.toHaveBeenCalled();
  });

  it('asks skipped users to complete their names before saving', async () => {
    session.profile = { ...session.profile!, firstName: null, lastName: null };
    const { result } = renderHook(() => useDebtThreshold());
    await act(async () => expect(await result.current.setThreshold(10)).toBe(false));
    expect(result.current.error).toContain('Completa tu nombre y apellido');
    expect(profilesService.updateMine).not.toHaveBeenCalled();
  });
});

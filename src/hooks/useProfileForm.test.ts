/**
 * Tests of the profile form hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { profilesService } from '@/services/profiles.service';
import { useProfileForm } from '@/hooks/useProfileForm';
import { ApiError } from '@/types/api';

const { setProfile } = vi.hoisted(() => ({ setProfile: vi.fn() }));
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ profile: null, user: { email: 'invented.name@correo.pe' }, setProfile }),
}));
vi.mock('@/services/profiles.service', () => ({ profilesService: { updateMine: vi.fn() } }));

beforeEach(() => vi.resetAllMocks());

const input = { firstName: ' Ana María ', lastName: ' Torres Pérez ', preferredCurrency: 'USD', monthlyIncome: 10, lifeCushion: 5, birthDate: '1995-03-14', debtLoadThreshold: 12.5 } as const;

describe('useProfileForm', () => {
  it('sends separate trimmed names, birth date and threshold and refreshes the profile', async () => {
    vi.mocked(profilesService.updateMine).mockResolvedValue({ id: 'p1', ...input, countryCode: 'PE', roles: [] });
    const { result } = renderHook(() => useProfileForm());
    await act(async () => expect(await result.current.save(input)).toBe(true));
    expect(profilesService.updateMine).toHaveBeenCalledWith({ ...input, firstName: 'Ana María', lastName: 'Torres Pérez' });
    expect(setProfile).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
  });

  it('never substitutes names from the email and sends null to clear the birth date', async () => {
    const { result } = renderHook(() => useProfileForm());
    await act(async () => { await result.current.save({ ...input, firstName: '', lastName: '', birthDate: null }); });
    expect(profilesService.updateMine).toHaveBeenCalledWith(expect.objectContaining({ firstName: '', lastName: '', birthDate: null }));
  });

  it('keeps the session profile when the API rejects the update', async () => {
    vi.mocked(profilesService.updateMine).mockRejectedValue(new ApiError(422));
    const { result } = renderHook(() => useProfileForm());
    await act(async () => expect(await result.current.save(input)).toBe(false));
    expect(setProfile).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });
});

it.each([[null, null], [10, null], [null, 5]])('sends a null financial triple when amounts are incomplete (%s, %s)', async (monthlyIncome, lifeCushion) => {
  const { result } = renderHook(() => useProfileForm());
  await act(async () => { await result.current.save({ ...input, monthlyIncome, lifeCushion }); });
  expect(profilesService.updateMine).toHaveBeenCalledWith(expect.objectContaining({ preferredCurrency: null, monthlyIncome: null, lifeCushion: null }));
});

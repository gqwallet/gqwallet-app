/**
 * Tests of the account appearance hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useAppearance } from '@/hooks/useAppearance';
import { profilesService } from '@/services/profiles.service';
import type { Profile } from '@/types/profile';

const session = vi.hoisted(() => ({ profile: null as Profile | null, setProfile: vi.fn() }));
const notify = vi.hoisted(() => vi.fn());
vi.mock('@/context/AuthContext', () => ({ useAuth: () => session }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify }) }));
vi.mock('@/services/profiles.service', () => ({ profilesService: { updateAppearance: vi.fn() } }));

const profile: Profile = { id: 'p1', firstName: 'Ana', lastName: 'Torres', preferredCurrency: 'PEN', monthlyIncome: null, lifeCushion: null, birthDate: null, debtLoadThreshold: 7, countryCode: 'PE', darkMode: 0, roles: [] };

beforeEach(() => {
  vi.resetAllMocks();
  session.profile = profile;
});

it('reads the theme from the account and saves a change through the API', async () => {
  vi.mocked(profilesService.updateAppearance).mockResolvedValue({ ...profile, darkMode: 1 });
  const { result } = renderHook(() => useAppearance());
  expect(result.current.theme).toBe('light');
  act(() => result.current.setTheme('dark'));
  expect(session.setProfile).toHaveBeenCalledWith({ ...profile, darkMode: 1 });
  expect(profilesService.updateAppearance).toHaveBeenCalledWith({ darkMode: 1 });
  await waitFor(() => expect(result.current.isSaving).toBe(false));
  expect(session.setProfile).toHaveBeenLastCalledWith({ ...profile, darkMode: 1 });
  expect(notify).not.toHaveBeenCalled();
});

it('reverts and warns when the save fails', async () => {
  vi.mocked(profilesService.updateAppearance).mockRejectedValue(new Error('offline'));
  const { result } = renderHook(() => useAppearance());
  act(() => result.current.setTheme('dark'));
  await waitFor(() => expect(result.current.isSaving).toBe(false));
  expect(session.setProfile).toHaveBeenLastCalledWith(profile);
  expect(notify).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
});

it('ignores the current theme and a missing profile', () => {
  const { result, rerender } = renderHook(() => useAppearance());
  act(() => result.current.setTheme('light'));
  session.profile = null;
  rerender();
  act(() => result.current.setTheme('dark'));
  expect(profilesService.updateAppearance).not.toHaveBeenCalled();
});

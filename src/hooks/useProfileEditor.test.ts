/**
 * Tests of profile editor validation and isolated section submissions.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import type { FormEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useProfileEditor } from '@/hooks/useProfileEditor';

const { save, notify, profile } = vi.hoisted(() => ({
  save: vi.fn(), notify: vi.fn(),
  profile: { firstName: 'Ana', lastName: 'Torres', countryCode: 'PE', birthDate: '1995-03-14', preferredCurrency: 'USD', monthlyIncome: null as number | null, lifeCushion: null as number | null, debtLoadThreshold: 7 },
}));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: { email: 'ana@correo.pe' } }) }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ notify }) }));
vi.mock('@/hooks/useProfileForm', () => ({ useProfileForm: () => ({ profile, save, isSaving: false, error: null }) }));
const event = { preventDefault: vi.fn() } as unknown as FormEvent;
beforeEach(() => { vi.clearAllMocks(); save.mockResolvedValue(true); profile.monthlyIncome = null; profile.lifeCushion = null; });

it('requires both financial amounts instead of saving a currency alone', async () => {
  const { result } = renderHook(useProfileEditor);
  await act(async () => { await result.current.handleParameters(event); });
  expect(result.current.errors.cushion).toBe('Ingresa tu ingreso mensual y tu colchón de vida.');
  expect(save).not.toHaveBeenCalled();
  expect(notify).not.toHaveBeenCalled();
});

it('saves the complete financial triple and preserves the saved personal data', async () => {
  const { result } = renderHook(useProfileEditor);
  act(() => { result.current.setCurrency('PEN'); result.current.setIncome('100'); result.current.setCushion('0'); result.current.setFirstName('Unsaved'); });
  await act(async () => { await result.current.handleParameters(event); });
  expect(save).toHaveBeenCalledWith({ firstName: 'Ana', lastName: 'Torres', countryCode: 'PE', birthDate: '1995-03-14', preferredCurrency: 'PEN', monthlyIncome: 100, lifeCushion: 0, debtLoadThreshold: 7 });
  expect(notify).toHaveBeenCalledOnce();
});

it.each([
  [null, null, null, null, null],
  [100, 0, 'USD', 100, 0],
  [100, null, null, null, null],
])('preserves a consistent financial triple when saving personal data (%s, %s)', async (income, cushion, currency, savedIncome, savedCushion) => {
  profile.monthlyIncome = income;
  profile.lifeCushion = cushion;
  const { result } = renderHook(useProfileEditor);
  act(() => { result.current.setFirstName('Andrea'); result.current.setCurrency('PEN'); result.current.setIncome('999'); });
  await act(async () => { await result.current.handlePersonal(event); });
  expect(save).toHaveBeenCalledWith({ firstName: 'Andrea', lastName: 'Torres', countryCode: 'PE', birthDate: '1995-03-14', preferredCurrency: currency, monthlyIncome: savedIncome, lifeCushion: savedCushion });
  expect(notify).toHaveBeenCalledOnce();
});

it.each([
  ['100', ''], ['', '50'], ['100', '101'],
])('rejects incomplete or excessive financial amounts (%s, %s)', async (income, cushion) => {
  const { result } = renderHook(useProfileEditor);
  act(() => { result.current.setIncome(income); result.current.setCushion(cushion); });
  await act(async () => { await result.current.handleParameters(event); });
  expect(result.current.errors.cushion).toBeTruthy();
  expect(save).not.toHaveBeenCalled();
  expect(notify).not.toHaveBeenCalled();
});

it('rejects missing names and does not save or announce success', async () => {
  const { result } = renderHook(useProfileEditor);
  act(() => result.current.setFirstName(' '));
  await act(async () => { await result.current.handlePersonal(event); });
  expect(result.current.errors.firstName).toBeTruthy();
  expect(result.current.hasErrors).toBe(true);
  expect(save).not.toHaveBeenCalled();
  expect(notify).not.toHaveBeenCalled();
});

it('keeps failed requests visible without announcing success', async () => {
  save.mockResolvedValue(false);
  const { result } = renderHook(useProfileEditor);
  await act(async () => { await result.current.handlePersonal(event); });
  expect(save).toHaveBeenCalledOnce();
  expect(notify).not.toHaveBeenCalled();
});

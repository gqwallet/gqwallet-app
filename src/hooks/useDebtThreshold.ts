/**
 * Debt load threshold chosen by the user (FR-037), persisted in the profile API.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useProfileForm } from '@/hooks/useProfileForm';

/** Default threshold of FR-037. */
export const DEFAULT_DEBT_THRESHOLD = 7;

/** State and actions for the profile-backed debt threshold. */
export interface DebtThresholdState {
  /** Persisted percentage. */
  threshold: number;
  /** Saves the percentage and refreshes the shared profile. */
  setThreshold: (value: number) => Promise<boolean>;
  /** Whether the update is in flight. */
  isSaving: boolean;
  /** Validation or API error. */
  error: string | null;
}

/**
 * Reads and saves the debt threshold through the profile API.
 *
 * @returns The persisted threshold, save action and request state.
 * @example
 * ```ts
 * const { threshold, setThreshold, isSaving } = useDebtThreshold();
 * ```
 */
export function useDebtThreshold(): DebtThresholdState {
  const { profile, save, isSaving, error } = useProfileForm();
  const hasNames = Boolean(profile?.firstName?.trim() && profile?.lastName?.trim());
  const setThreshold = useCallback(async (value: number) => {
    if (!profile || !hasNames || !Number.isFinite(value) || value < 0.01 || value > 100) return false;
    return save({
      firstName: profile.firstName ?? '', lastName: profile.lastName ?? '',
      preferredCurrency: profile.preferredCurrency,
      monthlyIncome: profile.monthlyIncome, lifeCushion: profile.lifeCushion,
      birthDate: profile.birthDate, debtLoadThreshold: value,
    });
  }, [profile, hasNames, save]);
  return {
    threshold: profile?.debtLoadThreshold ?? DEFAULT_DEBT_THRESHOLD,
    setThreshold, isSaving,
    error: !hasNames ? 'Completa tu nombre y apellido en Perfil antes de cambiar el umbral.' : error,
  };
}

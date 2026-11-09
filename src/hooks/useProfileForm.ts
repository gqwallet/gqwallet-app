/**
 * Saves personal data and financial preferences (FR-003, FR-014) for onboarding and the profile page.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@/hooks/useMutation';
import { profilesService } from '@/services/profiles.service';
import type { Profile, UpdateProfileInput } from '@/types/profile';

/** Result of {@link useProfileForm}. */
export interface ProfileFormState {
  /** Current profile from the session. */
  profile: Profile | null;
  /** Saves the profile; resolves whether it succeeded. */
  save: (input: UpdateProfileInput) => Promise<boolean>;
  /** Whether the request is in flight. */
  isSaving: boolean;
  /** Server error message. */
  error: string | null;
}

/**
 * Updates the profile and refreshes the session copy.
 *
 * @returns Profile, save action and state.
 * @example
 * ```ts
 * const { profile, save } = useProfileForm();
 * ```
 */
export function useProfileForm(): ProfileFormState {
  const { profile, setProfile } = useAuth();
  const { submit, isSubmitting, error } = useMutation((input: UpdateProfileInput) => profilesService.updateMine(input));
  const save = useCallback(
    async (input: UpdateProfileInput) => {
      const hasFinancials = input.monthlyIncome !== null && input.lifeCushion !== null;
      const updated = await submit({
        ...input,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        preferredCurrency: hasFinancials ? input.preferredCurrency : null,
        monthlyIncome: hasFinancials ? input.monthlyIncome : null,
        lifeCushion: hasFinancials ? input.lifeCushion : null,
      });
      if (updated) setProfile(updated);
      return updated !== null;
    },
    [submit, setProfile],
  );
  return {
    profile,
    save,
    isSaving: isSubmitting,
    error: error ? 'No guardamos los cambios. Revisa los datos e inténtalo de nuevo.' : null,
  };
}

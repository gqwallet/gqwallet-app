/**
 * Appearance of the signed-in account: reads it from the profile and saves changes through the API.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { profilesService } from '@/services/profiles.service';
import { flagFromTheme, themeFromFlag, type Theme } from '@/utils/theme';

/** Result of {@link useAppearance}. */
export interface UseAppearanceResult {
  /** Theme stored in the account. */
  theme: Theme;
  /** Applies the theme at once and saves it in the account; reverts when the save fails. */
  setTheme: (theme: Theme) => void;
  /** Whether a change is being saved. */
  isSaving: boolean;
}

/**
 * Exposes the account appearance; {@link AuthProvider} paints it whenever the profile changes.
 *
 * @returns The theme, its setter and the saving state.
 * @example
 * ```tsx
 * const { theme, setTheme } = useAppearance();
 * ```
 */
export function useAppearance(): UseAppearanceResult {
  const { profile, setProfile } = useAuth();
  const { notify } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const theme = themeFromFlag(profile?.darkMode);

  const setTheme = (next: Theme) => {
    if (!profile || isSaving || next === theme) return;
    const previous = profile;
    const darkMode = flagFromTheme(next);
    setProfile({ ...profile, darkMode });
    setIsSaving(true);
    profilesService
      .updateAppearance({ darkMode })
      .then(setProfile)
      .catch(() => {
        setProfile(previous);
        notify({ title: 'No guardamos la apariencia', detail: 'Revisa tu conexión e inténtalo de nuevo.', tone: 'danger' });
      })
      .finally(() => setIsSaving(false));
  };

  return { theme, setTheme, isSaving };
}

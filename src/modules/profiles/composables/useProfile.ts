import { ref } from 'vue';
import { profilesService } from '../services/profilesService';
import type { Profile, UpdateProfilePayload } from '../types/Profile';

export function useProfile() {
  const profile = ref<Profile | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchProfile() {
    loading.value = true;
    error.value = null;
    try {
      profile.value = await profilesService.getMe();
    } catch {
      error.value = 'No se pudo cargar el perfil';
    } finally {
      loading.value = false;
    }
  }

  async function saveProfile(payload: UpdateProfilePayload) {
    profile.value = await profilesService.update(payload);
    return profile.value;
  }

  return { profile, loading, error, fetchProfile, saveProfile };
}

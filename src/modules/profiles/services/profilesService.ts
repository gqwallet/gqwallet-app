import { httpClient } from '@/shared/http/httpClient';
import type { Profile, UpdateProfilePayload } from '../types/Profile';

const BASE = '/profiles';

export const profilesService = {
  async getMe(): Promise<Profile> {
    const { data } = await httpClient.get<Profile>(`${BASE}/me`);
    return data;
  },

  async update(payload: UpdateProfilePayload): Promise<Profile> {
    const { data } = await httpClient.put<Profile>(`${BASE}/me`, payload);
    return data;
  },
};

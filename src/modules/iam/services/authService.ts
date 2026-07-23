import { httpClient } from '@/shared/http/httpClient';
import { profilesService } from '@/modules/profiles/services/profilesService';
import type { AuthenticatedUser, SignInPayload, SignUpPayload } from '../types/AuthenticatedUser';

const BASE = '/authentication';

export const authService = {
  async signUp(payload: SignUpPayload): Promise<AuthenticatedUser> {
    const { data } = await httpClient.post<AuthenticatedUser>(`${BASE}/sign-up`, payload);
    return data;
  },

  // Sets the httpOnly JWT cookie; the returned body is the user, never the token.
  async signIn(payload: SignInPayload): Promise<AuthenticatedUser> {
    const { data } = await httpClient.post<AuthenticatedUser>(`${BASE}/sign-in`, payload);
    return data;
  },

  async signOut(): Promise<void> {
    await httpClient.post(`${BASE}/sign-out`);
  },

  // Outbound write into profiles (qs-vue-frontend module-boundary rule): sign-up only
  // takes email + password, so the full name captured in the sign-up form is saved as a
  // follow-up profile update — kept here so the sign-up composable never has to know
  // `profiles` exists.
  async saveDisplayName(firstName: string, lastName: string): Promise<void> {
    await profilesService.update({ firstName, lastName });
  },
};

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authService } from '@/modules/iam/services/authService';
import { profilesService } from '@/modules/profiles/services/profilesService';
import type { SignInPayload, SignUpPayload } from '@/modules/iam/types/AuthenticatedUser';

// Session state is the one thing shared across unrelated views (topbar, drawer, router
// guard), so it lives in Pinia rather than a local composable (qs-vue-frontend rule 6).
// The JWT is an httpOnly cookie invisible to JS, so "am I signed in?" is answered by
// probing a protected endpoint (GET /profiles/me), not by reading a token.
export const useAuthStore = defineStore('auth', () => {
  const email = ref<string | null>(null);
  const firstName = ref<string | null>(null);
  const lastName = ref<string | null>(null);
  const roles = ref<string[]>([]);
  const authenticated = ref<boolean | null>(null); // null = not yet checked

  // Full name as-is: the drawer clips it with CSS ellipsis (same as email) only when it
  // doesn't fit, instead of hard-cutting short names that would otherwise fit just fine.
  const displayName = computed(() => {
    const fullName = [firstName.value, lastName.value].filter(Boolean).join(' ');
    return fullName || 'Usuario';
  });

  // Gates the "Métricas" nav item only — never a real authorization boundary. The
  // backend enforces ROLE_ADMINISTRATOR on /api/v1/metrics regardless of this flag.
  const isAdmin = computed(() => roles.value.includes('ADMINISTRATOR'));

  // profiles/me always resolves (the backend self-heals an empty Profile on UserRegistered),
  // so this is safe to call right after sign-in even before onboarding fills the name in.
  async function loadProfile() {
    const profile = await profilesService.getMe();
    firstName.value = profile.firstName;
    lastName.value = profile.lastName;
    roles.value = profile.roles;
  }

  async function signUp(payload: SignUpPayload) {
    await authService.signUp(payload);
  }

  async function signIn(payload: SignInPayload) {
    const user = await authService.signIn(payload);
    email.value = user.email;
    authenticated.value = true;
    await loadProfile();
  }

  async function signOut() {
    await authService.signOut();
    email.value = null;
    firstName.value = null;
    lastName.value = null;
    roles.value = [];
    authenticated.value = false;
  }

  // Called before the first protected navigation: if the cookie is still valid the probe
  // succeeds and we mark the session live; any failure means no usable session.
  async function hydrate() {
    if (authenticated.value !== null) return;
    try {
      await loadProfile();
      authenticated.value = true;
    } catch {
      authenticated.value = false;
    }
  }

  return { email, firstName, lastName, roles, displayName, isAdmin, authenticated, loadProfile, signUp, signIn, signOut, hydrate };
});

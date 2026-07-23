import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '../services/authService';

// ViewModel for the auth forms: owns loading/error state and the post-auth navigation,
// so the .vue views stay presentational (qs-vue-frontend rules 6 & 9).
export function useAuthActions() {
  const auth = useAuthStore();
  const router = useRouter();
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function signIn(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      await auth.signIn({ email, password });
      router.push({ name: 'dashboard' });
    } catch {
      error.value = 'Correo o contraseña incorrectos';
    } finally {
      loading.value = false;
    }
  }

  // The backend sign-up only takes email + password; the full name (mockup field) is
  // saved to the profile right after the auto sign-in, so nothing is invented client-side.
  async function signUp(fullName: string, email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      await auth.signUp({ email, password });
      await auth.signIn({ email, password });
      const [firstName, ...rest] = fullName.trim().split(' ');
      if (firstName) {
        await authService.saveDisplayName(firstName, rest.join(' ') || firstName);
      }
      router.push({ name: 'onboarding' });
    } catch {
      error.value = 'No se pudo crear la cuenta. ¿El correo ya está registrado?';
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, signIn, signUp };
}

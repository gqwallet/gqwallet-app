<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProfile } from '../composables/useProfile';
import AppTextField from '@/shared/components/AppTextField.vue';
import AppButton from '@/shared/components/AppButton.vue';

// Standalone protected screen (own minimal chrome, no app sidebar) — matches screen 04.
const router = useRouter();
const { profile, fetchProfile, saveProfile } = useProfile();

const monthlyIncome = ref('');
const lifeCushion = ref('');
const saving = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  await fetchProfile();
  if (profile.value?.monthlyIncome != null) monthlyIncome.value = String(profile.value.monthlyIncome);
  if (profile.value?.lifeCushion != null) lifeCushion.value = String(profile.value.lifeCushion);
});

async function submit() {
  saving.value = true;
  error.value = null;
  try {
    // The PUT requires the existing name (backend @NotBlank), so it is carried through.
    await saveProfile({
      firstName: profile.value?.firstName ?? 'Usuario',
      lastName: profile.value?.lastName ?? 'GQWallet',
      monthlyIncome: Number(monthlyIncome.value),
      lifeCushion: Number(lifeCushion.value),
    });
    router.push({ name: 'dashboard' });
  } catch {
    error.value = 'Revisa los valores: deben ser mayores a cero y el colchón no puede superar tu ingreso.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-full flex-col bg-page">
    <header class="flex h-13 items-center border-b border-line bg-surface px-4">
      <span class="text-[16px] font-bold text-ink">Configuración inicial</span>
    </header>

    <main class="mx-auto w-full max-w-md flex-1 p-6">
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div class="h-full rounded-full bg-brand" style="width: 66%"></div>
      </div>
      <p class="mt-2 text-center text-[12px] text-muted">Paso 2 de 3</p>

      <h1 class="mt-4 text-[20px] font-bold text-ink">Cuéntanos sobre tus finanzas</h1>
      <p class="mt-1 text-[13px] text-muted">Para recomendaciones personalizadas.</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <AppTextField v-model="monthlyIncome" label="Ingreso fijo mensual (S/.)" type="number" step="0.01" placeholder="3500" />
        <AppTextField v-model="lifeCushion" label="Colchón mínimo de vida (S/.)" type="number" step="0.01" placeholder="1200" />

        <div class="rounded-card border border-brand-border bg-brand-bg p-3">
          <p class="text-[13px] font-bold text-brand">¿Qué es el colchón mínimo?</p>
          <p class="text-[13px] text-ink">Es el dinero reservado para tus gastos fijos del mes.</p>
        </div>

        <p v-if="error" class="text-[12px] text-expense">{{ error }}</p>

        <AppButton type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Continuar' }}</AppButton>
      </form>
    </main>
  </div>
</template>

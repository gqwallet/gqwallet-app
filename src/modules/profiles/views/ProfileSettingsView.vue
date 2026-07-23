<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useProfile } from '../composables/useProfile';
import AppTextField from '@/shared/components/AppTextField.vue';
import AppButton from '@/shared/components/AppButton.vue';

// FR-003 + FR-014 on a single endpoint (PUT /profiles/me): personal data and the
// financial settings live together, matching the "same endpoint" decision.
const { profile, fetchProfile, saveProfile } = useProfile();

const firstName = ref('');
const lastName = ref('');
const monthlyIncome = ref('');
const lifeCushion = ref('');
const saving = ref(false);
const saved = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  await fetchProfile();
  firstName.value = profile.value?.firstName ?? '';
  lastName.value = profile.value?.lastName ?? '';
  monthlyIncome.value = profile.value?.monthlyIncome != null ? String(profile.value.monthlyIncome) : '';
  lifeCushion.value = profile.value?.lifeCushion != null ? String(profile.value.lifeCushion) : '';
});

async function submit() {
  saving.value = true;
  saved.value = false;
  error.value = null;
  try {
    const hasFinancials = monthlyIncome.value !== '' && lifeCushion.value !== '';
    await saveProfile({
      firstName: firstName.value,
      lastName: lastName.value,
      monthlyIncome: hasFinancials ? Number(monthlyIncome.value) : null,
      lifeCushion: hasFinancials ? Number(lifeCushion.value) : null,
    });
    saved.value = true;
  } catch {
    error.value = 'No se pudieron guardar los cambios. Revisa los valores.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-md lg:max-w-lg">
    <form class="space-y-4 lg:space-y-5" @submit.prevent="submit">
      <AppTextField v-model="firstName" label="Nombre" />
      <AppTextField v-model="lastName" label="Apellido" />

      <div class="border-t border-line pt-4 lg:pt-5">
        <p class="mb-3 text-[13px] font-bold text-ink lg:text-[14px]">Configuración financiera</p>
        <div class="space-y-4 lg:space-y-5">
          <AppTextField v-model="monthlyIncome" label="Ingreso fijo mensual (S/.)" type="number" step="0.01" />
          <AppTextField v-model="lifeCushion" label="Colchón mínimo de vida (S/.)" type="number" step="0.01" />
        </div>
      </div>

      <p v-if="error" class="text-[12px] text-expense lg:text-[13px]">{{ error }}</p>
      <p v-else-if="saved" class="text-[12px] text-income lg:text-[13px]">Cambios guardados.</p>

      <AppButton type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar cambios' }}</AppButton>
    </form>
  </div>
</template>

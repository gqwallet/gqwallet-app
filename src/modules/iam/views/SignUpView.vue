<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import AuthLayout from '@/shared/components/AuthLayout.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppTextField from '@/shared/components/AppTextField.vue';
import { useAuthActions } from '../composables/useAuthActions';

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirm = ref('');
const { loading, error, signUp } = useAuthActions();

const mismatch = computed(() => confirm.value.length > 0 && confirm.value !== password.value);

function submit() {
  if (mismatch.value) return;
  signUp(fullName.value, email.value, password.value);
}
</script>

<template>
  <AuthLayout>
    <template #topbar-end>
      <RouterLink :to="{ name: 'sign-in' }" class="text-[13px] text-muted">
        ¿Ya tienes cuenta? <span class="font-medium text-brand">Iniciar sesión</span>
      </RouterLink>
    </template>

    <h1 class="mb-6 text-[19px] font-bold text-ink">Crear cuenta</h1>

    <form class="space-y-4" @submit.prevent="submit">
      <AppTextField v-model="fullName" label="Nombre completo" placeholder="Gonzalo Quedena" />
      <AppTextField v-model="email" label="Correo electrónico" type="email" placeholder="tu@correo.com" />
      <AppTextField v-model="password" label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" />
      <AppTextField v-model="confirm" label="Confirmar contraseña" type="password" placeholder="••••••••" />

      <p v-if="mismatch" class="text-[12px] text-expense">Las contraseñas no coinciden</p>
      <p v-else-if="error" class="text-[12px] text-expense">{{ error }}</p>

      <AppButton type="submit" :disabled="loading">{{ loading ? 'Creando…' : 'Registrarme' }}</AppButton>
    </form>

    <p class="mt-6 text-center text-[13px] text-muted">
      ¿Ya tienes cuenta?
      <RouterLink :to="{ name: 'sign-in' }" class="font-medium text-brand">Iniciar sesión</RouterLink>
    </p>
  </AuthLayout>
</template>

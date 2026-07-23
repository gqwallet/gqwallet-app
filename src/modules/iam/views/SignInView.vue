<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import AuthLayout from '@/shared/components/AuthLayout.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppTextField from '@/shared/components/AppTextField.vue';
import { useAuthActions } from '../composables/useAuthActions';

const email = ref('');
const password = ref('');
const { loading, error, signIn } = useAuthActions();
</script>

<template>
  <AuthLayout>
    <h1 class="mb-6 text-[19px] font-bold text-ink">Iniciar sesión</h1>

    <form class="space-y-4" @submit.prevent="signIn(email, password)">
      <AppTextField v-model="email" label="Correo electrónico" type="email" placeholder="tu@correo.com" />
      <AppTextField v-model="password" label="Contraseña" type="password" placeholder="••••••••" />

      <p v-if="error" class="text-[12px] text-expense">{{ error }}</p>

      <AppButton type="submit" :disabled="loading">{{ loading ? 'Ingresando…' : 'Ingresar' }}</AppButton>
    </form>

    <p class="mt-6 text-center text-[13px] text-muted">
      ¿No tienes cuenta?
      <RouterLink :to="{ name: 'sign-up' }" class="font-medium text-brand">Regístrate</RouterLink>
    </p>
  </AuthLayout>
</template>

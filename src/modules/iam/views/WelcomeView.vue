<script setup lang="ts">
import { useRouter } from 'vue-router';
import AuthLayout from '@/shared/components/AuthLayout.vue';
import AppButton from '@/shared/components/AppButton.vue';

const router = useRouter();
</script>

<template>
  <AuthLayout>
    <div class="flex flex-col items-center text-center">
      <div class="flex size-27.5 flex-col items-center justify-center rounded-2xl bg-ink">
        <span class="text-[40px] font-bold leading-none text-white">GQ</span>
        <span class="text-[20px] font-bold text-brand-soft">Wallet</span>
      </div>
      <h1 class="mt-6 text-[18px] font-bold text-ink">Bienvenido a GQWallet</h1>
      <p class="mt-1 text-[13px] text-muted">Gestión inteligente de tarjetas</p>

      <div class="mt-6 w-full space-y-3">
        <AppButton @click="router.push({ name: 'sign-up' })">Crear cuenta</AppButton>
        <AppButton variant="outline" @click="router.push({ name: 'sign-in' })">Iniciar sesión</AppButton>
      </div>

      <p class="mt-6 text-[12px] text-muted">Sin datos bancarios sensibles</p>
    </div>
  </AuthLayout>
</template>

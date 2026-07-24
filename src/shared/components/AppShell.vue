<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

// Authenticated layout: a persistent sidebar on desktop (lg+) and a hamburger drawer on
// mobile (screen 11). The page title comes from the active route's meta.title.
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const drawerOpen = ref(false);
const title = computed(() => (route.meta.title as string) ?? 'GQWallet');

// Métricas leads the list, ahead of Dashboard, and only renders for ROLE_ADMINISTRATOR
// (FR-013) — auth.isAdmin comes from ProfileResource.roles, hydrated on sign-in.
const navItems = computed(() => [
  ...(auth.isAdmin ? [{ to: '/metrics', label: 'Métricas' }] : []),
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/cards', label: 'Tarjetas' },
  { to: '/finances', label: 'Finanzas Personales' },
  { to: '/calendar', label: 'Calendario' },
  { to: '/profile', label: 'Configuración' },
]);

async function onSignOut() {
  await auth.signOut();
  router.push({ name: 'sign-in' });
}
</script>

<template>
  <div class="min-h-full lg:grid lg:grid-cols-[240px_1fr]">
    <!-- Desktop sidebar -->
    <aside class="hidden border-r border-line bg-surface lg:flex lg:flex-col">
      <div class="flex h-15 items-center border-b border-line px-6 text-[19px] font-bold text-ink">
        GQWallet
      </div>
      <nav class="flex-1 p-3">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="mb-1 block rounded-btn px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-page"
          active-class="bg-brand-bg text-brand"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="border-t border-line p-3">
        <button class="w-full rounded-btn px-3 py-2.5 text-left text-[15px] font-medium text-expense hover:bg-page" @click="onSignOut">
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex min-h-full flex-col">
      <!-- Mobile top nav -->
      <header class="flex h-13 items-center gap-3 border-b border-line bg-surface px-4 lg:hidden">
        <button class="flex size-6 flex-col justify-center gap-1.5" aria-label="Menú" @click="drawerOpen = true">
          <span class="block h-0.5 w-5 rounded bg-ink"></span>
          <span class="block h-0.5 w-5 rounded bg-ink"></span>
          <span class="block h-0.5 w-5 rounded bg-ink"></span>
        </button>
        <span class="text-[16px] font-bold text-ink">{{ title }}</span>
      </header>

      <!-- Desktop page title -->
      <header class="hidden h-15 items-center border-b border-line bg-surface px-8 lg:flex">
        <span class="text-[20px] font-bold text-ink">{{ title }}</span>
      </header>

      <main class="relative flex-1 p-4 lg:p-8">
        <RouterView />
      </main>
    </div>

    <!-- Mobile drawer (screen 11) -->
    <div v-if="drawerOpen" class="fixed inset-0 z-40 lg:hidden">
      <div class="absolute inset-0 bg-ink/40" @click="drawerOpen = false"></div>
      <div class="absolute left-0 top-0 flex h-full w-70 flex-col bg-surface">
        <div class="flex items-center gap-3 border-b border-line p-4">
          <div class="flex size-12 items-center justify-center rounded-full bg-brand-bg text-[16px] font-bold text-brand">
            {{ (auth.firstName ?? auth.email ?? 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-[14px] font-bold text-ink">{{ auth.displayName }}</p>
            <p class="truncate text-[12px] text-muted">{{ auth.email }}</p>
          </div>
        </div>
        <nav class="flex-1 p-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="block border-b border-line px-3 py-3 text-[15px] text-ink"
            active-class="text-brand"
            @click="drawerOpen = false"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <button class="border-t border-line px-5 py-4 text-left text-[15px] font-medium text-expense" @click="onSignOut">
          Cerrar sesión
        </button>
      </div>
    </div>
  </div>
</template>

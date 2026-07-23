<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCards } from '../composables/useCards';
import CreditCardVisual from '../components/CreditCardVisual.vue';
import AppFab from '@/shared/components/AppFab.vue';

const router = useRouter();
const { cards, loading, error, fetchCards } = useCards();

// Below 3 cards a single column reads better; from 3 on, two columns keeps the list from
// scrolling forever on desktop.
// space-y-4 puts margin-top on every card but the first; in grid mode that also lands on
// column 2, pushing it below column 1's row — lg:space-y-0 cancels it so `gap-5` is the
// only thing spacing the grid.
const listClass = computed(() =>
  cards.value.length >= 3 ? 'lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0' : 'lg:space-y-5',
);

onMounted(fetchCards);
</script>

<template>
  <div class="mx-auto max-w-2xl lg:max-w-3xl">
    <p class="mb-3 text-[11px] text-muted lg:text-[12px]">Mis tarjetas</p>

    <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando tarjetas…</p>
    <p v-else-if="error" class="text-[13px] text-expense lg:text-[14px]">{{ error }}</p>

    <div v-else-if="cards.length === 0" class="rounded-card border border-line bg-surface p-8 text-center lg:p-10">
      <p class="text-[14px] font-bold text-ink lg:text-[16px]">Aún no tienes tarjetas</p>
      <p class="mt-1 text-[13px] text-muted lg:text-[14px]">Registra tu primera tarjeta para anticipar tus pagos.</p>
    </div>

    <div v-else class="space-y-4" :class="listClass">
      <button v-for="card in cards" :key="card.id" class="block w-full text-left" @click="router.push(`/cards/${card.id}`)">
        <CreditCardVisual :card="card" />
      </button>
    </div>

    <AppFab @click="router.push({ name: 'card-new' })" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFinancesSummary } from '../composables/useFinancesSummary';
import { formatMoney } from '@/shared/util/money';
import AppFab from '@/shared/components/AppFab.vue';

const router = useRouter();
const { totalIncome, totalExpense, fetch } = useFinancesSummary();

const rows = [
  { to: '/categories', title: 'Categorías', subtitle: 'Gestión de categorías personalizadas' },
  { to: '/transactions', title: 'Historial de movimientos', subtitle: 'Todos tus ingresos y egresos' },
  { to: '/category-summary', title: 'Resumen por categoría', subtitle: 'Distribución mensual de gastos' },
];

onMounted(fetch);
</script>

<template>
  <div class="mx-auto max-w-2xl lg:max-w-3xl">
    <p class="mb-3 text-[11px] text-muted lg:mb-4 lg:text-[12px]">Gestión de movimientos</p>

    <div class="space-y-2 lg:space-y-2.5">
      <button
        v-for="row in rows"
        :key="row.to"
        class="flex w-full items-center justify-between rounded-card border border-line bg-surface px-4 py-4 text-left lg:px-5 lg:py-5"
        @click="router.push(row.to)"
      >
        <span>
          <span class="block text-[14px] font-bold text-ink lg:text-[15px]">{{ row.title }}</span>
          <span class="block text-[11px] text-muted lg:text-[12px]">{{ row.subtitle }}</span>
        </span>
        <span class="text-[18px] text-muted lg:text-[20px]">›</span>
      </button>
    </div>

    <div class="mt-4 rounded-card border border-line bg-surface p-4 lg:mt-5 lg:p-5">
      <p class="mb-2 text-[11px] text-muted lg:text-[12px]">Resumen</p>
      <div class="grid grid-cols-2 gap-4 border-t border-line pt-3 lg:gap-5 lg:pt-4">
        <div>
          <p class="text-[11px] text-muted lg:text-[12px]">Total ingresos</p>
          <p class="text-[16px] font-bold text-income lg:text-[19px]">{{ formatMoney(totalIncome) }}</p>
        </div>
        <div>
          <p class="text-[11px] text-muted lg:text-[12px]">Total gastos</p>
          <p class="text-[16px] font-bold text-expense lg:text-[19px]">{{ formatMoney(totalExpense) }}</p>
        </div>
      </div>
    </div>

    <AppFab @click="router.push({ name: 'transaction-new' })" />
  </div>
</template>

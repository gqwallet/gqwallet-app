<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactions } from '../composables/useTransactions';
import { categoryColor, categoryLabel } from '@/shared/domain/categories';
import { formatMoney } from '@/shared/util/money';
import type { TransactionType } from '../types/Transaction';
import AppFab from '@/shared/components/AppFab.vue';

const router = useRouter();
const { transactions, loading, error, fetchTransactions } = useTransactions();

type Filter = 'ALL' | 'INCOME' | 'EXPENSE';
const filter = ref<Filter>('ALL');
const filters: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'INCOME', label: 'Ingresos' },
  { key: 'EXPENSE', label: 'Gastos' },
];

const visible = computed(() =>
  filter.value === 'ALL' ? transactions.value : transactions.value.filter((t) => t.type === filter.value),
);

onMounted(fetchTransactions);

function typeLabel(type: TransactionType): string {
  return type === 'INCOME' ? 'Ingreso' : 'Gasto';
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}
</script>

<template>
  <div class="mx-auto max-w-2xl lg:max-w-3xl">
    <div class="mb-4 flex gap-1 rounded-btn border border-line bg-surface p-1 lg:mb-5 lg:p-1.5">
      <button
        v-for="f in filters"
        :key="f.key"
        class="flex-1 rounded-btn py-2 text-[12px] font-medium lg:py-2.5 lg:text-[14px]"
        :class="filter === f.key ? 'bg-ink text-white' : 'text-muted'"
        @click="filter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando…</p>
    <p v-else-if="error" class="text-[13px] text-expense lg:text-[14px]">{{ error }}</p>
    <div v-else-if="visible.length === 0" class="rounded-card border border-line bg-surface p-8 text-center text-[13px] text-muted lg:text-[14px]">
      No hay movimientos para este filtro.
    </div>

    <div v-else class="space-y-2 lg:space-y-2.5">
      <div
        v-for="t in visible"
        :key="t.id"
        class="flex items-center gap-3 rounded-[10px] border border-line bg-surface px-3 py-3 lg:px-4 lg:py-4"
      >
        <span class="size-2 rounded" :style="{ backgroundColor: categoryColor(t.category) }"></span>
        <div class="min-w-0 flex-1">
          <p class="text-[13px] font-bold text-ink lg:text-[15px]">{{ categoryLabel(t.category) }}</p>
          <p class="text-[11px] text-muted lg:text-[12px]">{{ formatDate(t.registeredAt) }} · {{ typeLabel(t.type) }}</p>
        </div>
        <span class="text-[13px] font-bold lg:text-[15px]" :class="t.type === 'INCOME' ? 'text-income' : 'text-expense'">
          {{ t.type === 'INCOME' ? '+' : '-' }} {{ formatMoney(t.amount) }}
        </span>
      </div>
    </div>

    <AppFab @click="router.push({ name: 'transaction-new' })" />
  </div>
</template>

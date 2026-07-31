<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCategories } from '../composables/useCategories';
import { useTransactions } from '../composables/useTransactions';
import { categoryColor, categoryLabel } from '@/shared/domain/categories';

// The category set is fixed and system-owned (no user CRUD). The per-category movement
// count is derived from the transactions list — no dedicated backend endpoint needed.
const { categories, loading, error, fetchCategories } = useCategories();
const { transactions, fetchTransactions } = useTransactions();

const counts = computed(() => {
  const map: Record<string, number> = {};
  // Card payments carry no category (FR-018), so they simply do not belong to any bucket.
  for (const t of transactions.value) {
    if (t.category === null) continue;
    map[t.category] = (map[t.category] ?? 0) + 1;
  }
  return map;
});

onMounted(() => {
  fetchCategories();
  fetchTransactions();
});
</script>

<template>
  <div class="mx-auto max-w-2xl lg:max-w-3xl">
    <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando…</p>
    <p v-else-if="error" class="text-[13px] text-expense lg:text-[14px]">{{ error }}</p>

    <div v-else class="space-y-2 lg:space-y-2.5">
      <div
        v-for="c in categories"
        :key="c"
        class="flex items-center gap-3 rounded-[10px] border border-line bg-surface px-3 py-3 lg:px-4 lg:py-4"
      >
        <span class="size-9 rounded-lg lg:size-10" :style="{ backgroundColor: categoryColor(c) }"></span>
        <div class="flex-1">
          <p class="text-[13px] font-bold text-ink lg:text-[15px]">{{ categoryLabel(c) }}</p>
          <p class="text-[11px] text-muted lg:text-[12px]">{{ counts[c] ?? 0 }} movimientos</p>
        </div>
      </div>
    </div>
  </div>
</template>

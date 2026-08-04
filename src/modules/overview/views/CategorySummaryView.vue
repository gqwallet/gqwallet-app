<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { useCategorySummary } from '../composables/useCategorySummary';
import { categoryColor, categoryLabel } from '@/shared/domain/categories';
import { formatMoney } from '@/shared/util/money';
import { resolveCssColor } from '@/shared/util/color';

ChartJS.register(ArcElement, Tooltip);

const { slices, total, isEmpty, loading, error, fetch } = useCategorySummary();

onMounted(fetch);

const chartData = computed(() => ({
  labels: slices.value.map((s) => categoryLabel(s.code)),
  datasets: [
    {
      data: slices.value.map((s) => s.total),
      backgroundColor: slices.value.map((s) => resolveCssColor(categoryColor(s.code))),
      borderWidth: 0,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; parsed: number }) => `${ctx.label}: ${formatMoney(ctx.parsed)}`,
      },
    },
  },
};
</script>

<template>
  <div class="mx-auto max-w-md lg:max-w-xl">
    <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando…</p>
    <p v-else-if="error" class="text-[13px] text-expense lg:text-[14px]">{{ error }}</p>

    <div v-else-if="isEmpty" class="rounded-card border border-line bg-surface p-8 text-center text-[13px] text-muted lg:text-[14px]">
      Aún no hay gastos para resumir este período.
    </div>

    <template v-else>
      <div class="rounded-card border border-line bg-surface p-4 lg:p-5">
        <p class="mb-4 text-center text-[13px] text-muted lg:text-[14px]">Distribución de gastos</p>
        <div class="relative mx-auto size-40 lg:size-48">
          <Doughnut :data="chartData" :options="chartOptions" />
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span class="text-[13px] font-bold text-ink lg:text-[15px]">{{ formatMoney(total) }}</span>
          </div>
        </div>
      </div>

      <div class="mt-4 space-y-3 lg:mt-5 lg:space-y-4">
        <div v-for="s in slices" :key="s.code">
          <div class="mb-1 flex items-center justify-between text-[13px] lg:text-[14px]">
            <span class="text-ink">{{ categoryLabel(s.code) }}</span>
            <span class="text-muted">{{ formatMoney(s.total) }} · {{ s.pct }}%</span>
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-page lg:h-2">
            <div class="h-full rounded-full" :style="{ width: `${s.pct}%`, backgroundColor: categoryColor(s.code) }"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

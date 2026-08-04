<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { resolveCssColor } from '@/shared/util/color';
import { formatMonthOnly } from '@/shared/util/dates';
import type { DailyTransactionCount } from '../types/DailyTransactionCount';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

const props = defineProps<{ counts: DailyTransactionCount[] }>();

const chartData = computed(() => ({
  labels: props.counts.map((c) => c.date),
  datasets: [
    {
      data: props.counts.map((c) => c.count),
      borderColor: resolveCssColor('var(--color-brand)'),
      backgroundColor: resolveCssColor('var(--color-brand)'),
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2,
    },
  ],
}));

// FR-020: the backend already returns one point per day across the fixed 5-month window —
// this only decides which of those daily ticks gets a visible label, so the axis reads by
// month instead of one crowded label per day. A day qualifies when it's the 1st of its month.
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        callback(_value: unknown, index: number) {
          const date = props.counts[index]?.date;
          if (!date) return '';
          return date.endsWith('-01') ? formatMonthOnly(date) : '';
        },
      },
    },
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'line'>) => `${ctx.parsed.y} movimiento(s)`,
      },
    },
  },
};
</script>

<template>
  <div class="h-48 lg:h-56">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

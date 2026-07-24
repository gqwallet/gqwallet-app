<script setup lang="ts">
import { onMounted } from 'vue';
import { useMetrics } from '../composables/useMetrics';

const { metrics, loading, error, fetch } = useMetrics();

onMounted(fetch);
</script>

<template>
  <div class="mx-auto max-w-2xl lg:max-w-4xl">
    <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando métricas…</p>
    <p v-else-if="error" class="text-[13px] text-expense lg:text-[14px]">{{ error }}</p>

    <!-- Same tile design as DashboardView (rounded-card border-line bg-surface): the
         grid holds a single tile today, but grows in place as the backend exposes
         more of FR-013's aggregated metrics — no layout rework needed then. -->
    <div v-else class="grid grid-cols-2 gap-3 lg:gap-4">
      <div class="rounded-card border border-line bg-surface p-3 lg:p-4">
        <p class="text-[10px] text-muted lg:text-[11px]">Usuarios registrados</p>
        <p class="mt-1 text-[18px] font-bold text-ink lg:text-[21px]">{{ metrics?.registeredUsers ?? '—' }}</p>
      </div>
    </div>
  </div>
</template>

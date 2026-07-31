<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboard } from '../composables/useDashboard';
import { formatMoney } from '@/shared/util/money';
import { formatDateOnly, daysUntil } from '@/shared/util/dates';
import AppFab from '@/shared/components/AppFab.vue';

const router = useRouter();
const { dashboard, monthlyIncome, totalIncome, totalExpense, loading, error, fetch } = useDashboard();

onMounted(fetch);
</script>

<template>
  <div class="mx-auto max-w-2xl lg:max-w-4xl">
    <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando panel…</p>
    <p v-else-if="error" class="text-[13px] text-expense lg:text-[14px]">{{ error }}</p>

    <template v-else>
      <!-- Summary row (mobile only) -->
      <div class="grid grid-cols-2 gap-3 lg:hidden">
        <div class="rounded-card border border-line bg-surface p-3">
          <p class="text-[10px] text-muted">Ingreso mensual</p>
          <p class="mt-1 text-[18px] font-bold text-ink">{{ monthlyIncome != null ? formatMoney(monthlyIncome) : '—' }}</p>
          <p v-if="monthlyIncome != null" class="mt-1 flex items-center gap-1 text-[10px] text-income">
            <span class="size-1.5 rounded-full bg-income"></span> Activo
          </p>
        </div>
        <div class="rounded-card border border-line bg-surface p-3">
          <p class="text-[10px] text-muted">Balance disponible</p>
          <p class="mt-1 text-[18px] font-bold text-ink">{{ formatMoney(dashboard?.balance ?? 0) }}</p>
        </div>
      </div>

      <!-- Upcoming payments (mobile only) -->
      <div
        v-if="dashboard && dashboard.upcomingCards.length"
        class="mt-3 flex max-h-60 flex-col rounded-card border border-line bg-surface p-3 lg:hidden"
      >
        <p class="shrink-0 text-[11px] text-muted">Próximos pagos</p>
        <div class="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
          <div v-for="c in dashboard.upcomingCards" :key="c.cardId" class="flex items-center gap-3 rounded-lg bg-page p-3">
            <span class="w-1.5 shrink-0 self-stretch rounded-full" :style="{ backgroundColor: c.color }"></span>
            <div class="min-w-0 flex-1">
              <p class="text-[13px] font-bold text-ink">{{ c.name }}</p>
              <div class="mt-0.5 flex items-center justify-between gap-2">
                <p class="text-[11px] text-muted">Vence: {{ formatDateOnly(c.paymentDueDate) }} · {{ daysUntil(c.paymentDueDate) }} días</p>
                <p class="shrink-0 text-[11px] font-semibold text-ink">Por pagar: {{ formatMoney(c.amountDue) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense / income totals (mobile only) -->
      <div class="mt-3 grid grid-cols-2 gap-3 lg:hidden">
        <div class="rounded-card border border-line bg-surface p-3">
          <p class="text-[10px] text-muted">Gastos</p>
          <p class="mt-1 text-[16px] font-bold text-expense">{{ formatMoney(totalExpense) }}</p>
        </div>
        <div class="rounded-card border border-line bg-surface p-3">
          <p class="text-[10px] text-muted">Ingresos</p>
          <p class="mt-1 text-[16px] font-bold text-income">{{ formatMoney(totalIncome) }}</p>
        </div>
      </div>

      <!-- Desktop layout: metrics form their own 2x2 grid so their row heights never
           depend on the "Próximos pagos" list next to them — a shared grid with that list
           row-spanning both rows forced CSS Grid to stretch every row to the list's height,
           leaving large blank gaps in the short cards as more cards were added. -->
      <div class="hidden lg:flex lg:items-start lg:gap-4">
        <div class="grid flex-1 grid-cols-2 gap-4">
          <div class="rounded-card border border-line bg-surface p-4">
            <p class="text-[11px] text-muted">Ingreso mensual</p>
            <p class="mt-1 text-[21px] font-bold text-ink">{{ monthlyIncome != null ? formatMoney(monthlyIncome) : '—' }}</p>
            <p v-if="monthlyIncome != null" class="mt-1 flex items-center gap-1 text-[11px] text-income">
              <span class="size-1.5 rounded-full bg-income"></span> Activo
            </p>
          </div>
          <div class="rounded-card border border-line bg-surface p-4">
            <p class="text-[11px] text-muted">Balance disponible</p>
            <p class="mt-1 text-[21px] font-bold text-ink">{{ formatMoney(dashboard?.balance ?? 0) }}</p>
          </div>
          <div class="rounded-card border border-line bg-surface p-4">
            <p class="text-[11px] text-muted">Gastos</p>
            <p class="mt-1 text-[19px] font-bold text-expense">{{ formatMoney(totalExpense) }}</p>
          </div>
          <div class="rounded-card border border-line bg-surface p-4">
            <p class="text-[11px] text-muted">Ingresos</p>
            <p class="mt-1 text-[19px] font-bold text-income">{{ formatMoney(totalIncome) }}</p>
          </div>
        </div>

        <!-- Upcoming payments list. Height is capped and scrolls internally past a few
             cards instead of growing past the metrics grid beside it. -->
        <div
          v-if="dashboard && dashboard.upcomingCards.length"
          class="flex w-96 shrink-0 flex-col rounded-card border border-line bg-surface p-5 lg:max-h-60"
        >
          <p class="shrink-0 text-[11px] text-muted">Próximos pagos</p>
          <div class="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
            <div v-for="c in dashboard.upcomingCards" :key="c.cardId" class="flex items-center gap-3 rounded-lg bg-page p-3">
              <span class="w-1.5 shrink-0 self-stretch rounded-full" :style="{ backgroundColor: c.color }"></span>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-bold text-ink">{{ c.name }}</p>
                <div class="mt-0.5 flex items-center justify-between gap-2">
                  <p class="text-[11px] text-muted">Vence: {{ formatDateOnly(c.paymentDueDate) }} · {{ daysUntil(c.paymentDueDate) }} días</p>
                  <p class="shrink-0 text-[11px] font-semibold text-ink">Por pagar: {{ formatMoney(c.amountDue) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <AppFab @click="router.push({ name: 'transaction-new' })" />
  </div>
</template>

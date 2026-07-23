<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentCalendar } from '../composables/usePaymentCalendar';
import { formatDateOnly } from '@/shared/util/dates';
import { composeCycleDates, dayOfMonth } from '@/shared/util/billingCycle';

// Google Calendar sync (FR-016) is out of scope for this phase, so no "Add to Google
// Calendar" action is rendered — only the in-app color-coded calendar (FR-015).
const { entries, loading, error, fetch } = usePaymentCalendar();

const router = useRouter();
const cursor = ref(new Date());
const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }),
);

// Days marked by an event, keyed by day-of-month (not a full date) so a card's billing/
// payment day repeats on every month shown, not just the month it was registered in.
const marks = computed(() => {
  const map: Record<number, string[]> = {};
  for (const e of entries.value) {
    const billingDay = Number(e.billingDate.slice(8, 10));
    const paymentDay = Number(e.paymentDueDate.slice(8, 10));
    (map[billingDay] ??= []).push(e.color);
    (map[paymentDay] ??= []).push(e.color);
  }
  return map;
});

const grid = computed(() => {
  const year = cursor.value.getFullYear();
  const month = cursor.value.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { day: number; key: string }[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ day: 0, key: `pad-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, key });
  }
  return cells;
});

// The entries list shows facturación/pago re-anchored to whichever month `cursor` is on —
// same day-of-month as the card's cycle, rolled forward the same way registration does —
// instead of the fixed date the card happened to be registered under.
const entriesForMonth = computed(() =>
  entries.value.map((e) => ({
    ...e,
    ...composeCycleDates(dayOfMonth(e.billingDate), dayOfMonth(e.paymentDueDate), cursor.value),
  })),
);

function shiftMonth(delta: number) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + delta, 1);
}
onMounted(fetch);
</script>

<template>
  <div class="mx-auto max-w-md lg:max-w-xl">
    <div class="mb-3 flex items-center justify-between lg:mb-4">
      <button class="px-2 text-[18px] text-muted lg:text-[21px]" @click="shiftMonth(-1)">‹</button>
      <span class="text-[16px] font-bold capitalize text-ink lg:text-[19px]">{{ monthLabel }}</span>
      <button class="px-2 text-[18px] text-muted lg:text-[21px]" @click="shiftMonth(1)">›</button>
    </div>

    <div class="rounded-card border border-line bg-surface p-3 lg:p-4">
      <div class="mb-2 grid grid-cols-7 text-center text-[11px] text-muted lg:text-[12px]">
        <span v-for="(d, i) in dayLabels" :key="i">{{ d }}</span>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center lg:gap-1.5">
        <div v-for="cell in grid" :key="cell.key" class="flex aspect-square flex-col items-center justify-center rounded-lg text-[13px] lg:text-[15px]">
          <template v-if="cell.day">
            <span class="text-ink">{{ cell.day }}</span>
            <span v-if="marks[cell.day]" class="mt-0.5 flex gap-0.5">
              <span
                v-for="(c, i) in marks[cell.day]"
                :key="i"
                class="mark-pulse size-1.5 rounded-full"
                :style="{ backgroundColor: c, '--mark-color': c, animationDelay: `${i * 150}ms` }"
              ></span>
            </span>
          </template>
        </div>
      </div>
    </div>

    <p v-if="loading" class="mt-4 text-[13px] text-muted lg:text-[14px]">Cargando…</p>
    <p v-else-if="error" class="mt-4 text-[13px] text-expense lg:text-[14px]">{{ error }}</p>

    <div v-else-if="entries.length === 0" class="mt-4 rounded-card border border-line bg-surface p-6 text-center text-[13px] text-muted lg:text-[14px]">
      Registra una tarjeta para ver tus fechas clave.
    </div>

      <div v-else class="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-2.5">
      <button
        v-for="e in entriesForMonth"
        :key="e.cardId"
        class="block rounded-card border border-line bg-surface p-3 lg:p-4"
        @click="router.push(`/cards/${e.cardId}`)"
      >
        <div class="flex items-center gap-2">
          <span class="size-3 rounded-full" :style="{ backgroundColor: e.color }"></span>
          <span class="text-[14px] font-bold text-ink lg:text-[15px]">{{ e.cardName }}</span>
        </div>
        <p class="mt-1 text-[12px] text-muted lg:text-[13px] text-start">
          Facturación: {{ formatDateOnly(e.billingDate) }} · Pago: {{ formatDateOnly(e.paymentDueDate) }}
        </p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mark-pulse {
  animation: mark-pulse 1.8s ease-in-out infinite;
}

@keyframes mark-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--mark-color) 45%, transparent);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--mark-color) 0%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mark-pulse {
    animation: none;
  }
}
</style>

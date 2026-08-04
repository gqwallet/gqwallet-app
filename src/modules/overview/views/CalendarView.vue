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
const today = new Date();
const cursor = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// Paging further than a month either way isn't useful for a billing calendar — cycles this
// far out haven't been registered yet and cycles that old are settled — so navigation is a
// fixed 3-tab grid (previous / current / next) instead of open-ended ‹ › paging.
const monthOptions = computed(() =>
  [-1, 0, 1].map((offset) => {
    const date = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return { date, key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }) };
  }),
);

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }),
);

interface DayMark {
  cardId: string;
  color: string;
  type: 'billing' | 'payment';
}

// Days marked by an event, keyed by day-of-month (not a full date) so a card's billing/
// payment day repeats on every month shown, not just the month it was registered in. Each
// mark carries its type (billing vs payment) so the two can be told apart visually (ring vs
// solid dot) — otherwise a card's billing day and payment day look identical on the grid.
const marks = computed(() => {
  const map: Record<number, DayMark[]> = {};
  for (const e of entries.value) {
    const billingDay = Number(e.billingDate.slice(8, 10));
    const paymentDay = Number(e.paymentDueDate.slice(8, 10));
    (map[billingDay] ??= []).push({ cardId: e.cardId, color: e.color, type: 'billing' });
    (map[paymentDay] ??= []).push({ cardId: e.cardId, color: e.color, type: 'payment' });
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

function shortLabel(d: Date): string {
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// How far "today" is into the cycle's own window (the day after the previous cutoff,
// through this cutoff) — 0% right as the window opens, 100% once it's closed. Clamped so a
// cycle viewed before it starts reads as empty and one already closed reads as full, instead
// of a negative/over-100 value.
function cycleProgress(windowStart: Date, billingDate: Date): number {
  const total = billingDate.getTime() - windowStart.getTime();
  if (total <= 0) return 100;
  const elapsed = today.getTime() - windowStart.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

// The entries list shows facturación/pago re-anchored to whichever month `cursor` is on,
// plus the day the *current* cycle window opened (the day after the previous cutoff) — so
// each card's row can always show its full "11 jul – 10 ago → paga 5 sep" range without
// requiring any tap or selection to reveal it.
const entriesForMonth = computed(() =>
  entries.value.map((e) => {
    const billingDay = dayOfMonth(e.billingDate);
    const dates = composeCycleDates(billingDay, dayOfMonth(e.paymentDueDate), cursor.value);
    const prevMonth = new Date(cursor.value.getFullYear(), cursor.value.getMonth() - 1, 1);
    const windowStart = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), billingDay + 1);
    return {
      ...e,
      ...dates,
      windowStartLabel: shortLabel(windowStart),
      progressPercent: cycleProgress(windowStart, parseIsoDate(dates.billingDate)),
    };
  }),
);

onMounted(fetch);
</script>

<template>
  <div class="mx-auto max-w-md lg:flex lg:h-[calc(100vh-7.75rem)] lg:max-w-xl lg:flex-col">
    <!-- Desktop: bounded to the viewport height left over below AppShell's topbar (h-15 =
         3.75rem) and <main>'s own padding (lg:p-8 = 4rem vertical) — 7.75rem total — with the
         view itself as a flex column so only the card list scrolls internally below, instead
         of the whole page growing past the viewport. Mobile is untouched (normal block flow,
         page-level scroll, same as every other view). -->
    <div class="mb-3 grid grid-cols-3 gap-2 lg:mb-4 lg:shrink-0">
      <button
        v-for="opt in monthOptions"
        :key="opt.key"
        type="button"
        class="rounded-btn border px-2 py-2 text-center text-[13px] font-medium capitalize transition-colors lg:text-[14px]"
        :class="isSameMonth(opt.date, cursor) ? 'border-brand bg-brand-bg text-brand' : 'border-line bg-surface text-ink hover:bg-page'"
        @click="cursor = opt.date"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="rounded-card border border-line bg-surface p-3 lg:shrink-0 lg:p-4">
      <p class="mb-2 text-center text-[13px] font-bold capitalize text-ink lg:text-[14px]">{{ monthLabel }}</p>
      <div class="mb-3 flex items-center justify-center gap-4 text-[10px] text-muted lg:text-[11px]">
        <span class="flex items-center gap-1"><span class="size-2 rounded-full border-[1.5px] border-muted"></span> Facturación</span>
        <span class="flex items-center gap-1"><span class="size-1.5 rounded-full bg-muted"></span> Pago</span>
      </div>
      <div class="mb-2 grid grid-cols-7 text-center text-[11px] text-muted lg:text-[12px]">
        <span v-for="(d, i) in dayLabels" :key="i">{{ d }}</span>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center lg:gap-1.5">
        <div v-for="cell in grid" :key="cell.key" class="flex aspect-square flex-col items-center justify-center rounded-lg text-[13px] lg:text-[15px]">
          <template v-if="cell.day">
            <span class="text-ink">{{ cell.day }}</span>
            <span v-if="marks[cell.day]" class="mt-0.5 flex gap-0.5">
              <span
                v-for="(m, i) in marks[cell.day]"
                :key="i"
                class="rounded-full"
                :class="m.type === 'billing' ? 'size-2 border-[1.5px] bg-surface' : 'size-1.5'"
                :style="m.type === 'billing' ? { borderColor: m.color } : { backgroundColor: m.color }"
              ></span>
            </span>
          </template>
        </div>
      </div>
    </div>

    <p v-if="loading" class="mt-4 text-[13px] text-muted lg:shrink-0 lg:text-[14px]">Cargando…</p>
    <p v-else-if="error" class="mt-4 text-[13px] text-expense lg:shrink-0 lg:text-[14px]">{{ error }}</p>

    <div
      v-else-if="entries.length === 0"
      class="mt-4 rounded-card border border-line bg-surface p-6 text-center text-[13px] text-muted lg:shrink-0 lg:text-[14px]"
    >
      Registra una tarjeta para ver tus fechas clave.
    </div>

    <!-- The only element that actually scrolls on desktop: flex-1 fills whatever height is
         left inside the view's own viewport-bound height (set on the root above) once the
         month tabs and calendar box have taken their natural size. min-h-0 is required for
         a flex child to shrink below its content size instead of forcing the parent to grow. -->
    <div v-else class="mt-4 grid grid-cols-1 gap-2.5 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:content-start lg:gap-3 lg:overflow-y-auto lg:pr-1">
      <button
        v-for="e in entriesForMonth"
        :key="e.cardId"
        class="block w-full rounded-card border border-line bg-surface p-3.5 text-start lg:p-4"
        @click="router.push(`/cards/${e.cardId}`)"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex min-w-0 items-center gap-2">
            <span class="size-3 shrink-0 rounded-full" :style="{ backgroundColor: e.color }"></span>
            <span class="truncate text-[14px] font-bold text-ink lg:text-[15px]">{{ e.cardName }}</span>
          </div>
          <span class="shrink-0 text-[11px] font-medium text-muted lg:text-[12px]">{{ Math.round(e.progressPercent) }}%</span>
        </div>

        <!-- Progress bar: fills as "today" advances through the cycle's own window (the
             day after the previous cutoff, through this cutoff) — empty if the window
             hasn't opened yet, full once it has already closed. -->
        <div class="mt-2.5 flex items-center gap-2">
          <span class="shrink-0 text-[10px] text-muted lg:text-[11px]">{{ e.windowStartLabel }}</span>
          <span class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-page">
            <span
              class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
              :style="{ width: `${e.progressPercent}%`, backgroundColor: e.color }"
            ></span>
          </span>
          <span class="shrink-0 text-[10px] text-muted lg:text-[11px]">{{ formatDateOnly(e.billingDate) }}</span>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted lg:text-[13px]">
          <span class="flex items-center gap-1">
            <span class="size-1.5 rounded-full border-[1.5px]" :style="{ borderColor: e.color }"></span>
            Corte {{ formatDateOnly(e.billingDate) }}
          </span>
          <span class="flex items-center gap-1">
            <span class="size-1.5 rounded-full" :style="{ backgroundColor: e.color }"></span>
            Paga {{ formatDateOnly(e.paymentDueDate) }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

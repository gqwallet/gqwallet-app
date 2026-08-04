<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTransactions } from '../composables/useTransactions';
import { categoryColor, categoryLabel } from '@/shared/domain/categories';
import { formatMoney } from '@/shared/util/money';
import type { Transaction, TransactionType } from '../types/Transaction';
import AppFab from '@/shared/components/AppFab.vue';
import iconTrash from '@/assets/icon-trash.svg?raw';

const router = useRouter();
const { transactions, loading, error, deleteError, fetchTransactions, removeTransaction } = useTransactions();

type Filter = 'ALL' | TransactionType;
const filter = ref<Filter>('ALL');
const filters: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'INCOME', label: 'Ingresos' },
  { key: 'EXPENSE', label: 'Gastos' },
  { key: 'CARD_PAYMENT', label: 'Pagos' },
];

const visible = computed(() =>
  filter.value === 'ALL' ? transactions.value : transactions.value.filter((t) => t.type === filter.value),
);

onMounted(fetchTransactions);

const TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  CARD_PAYMENT: 'Pago de tarjeta',
};

function typeLabel(type: TransactionType): string {
  return TYPE_LABELS[type];
}

// A card payment is a real cash outflow, so it carries the same minus sign as an expense —
// but it is not consumption, so it gets the neutral ink colour instead of the expense red.
function amountClass(type: TransactionType): string {
  if (type === 'INCOME') return 'text-income';
  return type === 'CARD_PAYMENT' ? 'text-ink' : 'text-expense';
}

// The row title is the category, which a payment does not have — name the card action
// instead of falling back to a meaningless "Sin categoría".
function rowTitle(transaction: Transaction): string {
  return transaction.type === 'CARD_PAYMENT' ? 'Pago de tarjeta' : categoryLabel(transaction.category);
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

// FR-021: a CARD_PAYMENT can never be deleted, and neither can an EXPENSE that already
// existed when a payment settled its cycle — deleting it would leave that (permanent)
// payment standing for an amount nothing backs anymore. A NEW expense registered on that
// same cycle *after* it was paid was never part of what the payment covered, so it stays
// correctable — hence the registeredAt comparison, not just "does this cycle have a
// payment". The backend is the real enforcer of both rules, but the data to predict them is
// already sitting in `transactions` (no extra fetch needed), so the icon simply isn't shown
// where it would always fail — same "disable the ineligible option" precedent PayCardView
// already uses for a cycle with nothing owed.
function isDeletable(transaction: Transaction): boolean {
  if (transaction.type === 'CARD_PAYMENT') return false;
  if (transaction.type === 'EXPENSE' && transaction.cardId && transaction.cycleClosingDate) {
    return !transactions.value.some(
      (t) => t.type === 'CARD_PAYMENT'
        && t.cardId === transaction.cardId
        && t.cycleClosingDate === transaction.cycleClosingDate
        && new Date(t.registeredAt) > new Date(transaction.registeredAt),
    );
  }
  return true;
}

// Always-visible affordance for eligible rows (no swipe/long-press) — matches
// CardDetailView's own "Eliminar tarjeta" precedent, including the native confirm() with no
// custom dialog.
async function onDelete(transaction: Transaction) {
  if (!confirm('¿Eliminar este movimiento?')) return;
  await removeTransaction(transaction.id);
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

    <!-- Independent of the loading/error/empty/list chain below: a failed delete must not
         hide the list the user is still looking at, only the initial fetch failure does. -->
    <p v-if="deleteError" class="mb-3 text-[13px] text-expense lg:mb-4 lg:text-[14px]">{{ deleteError }}</p>

    <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando…</p>
    <p v-else-if="error" class="text-[13px] text-expense lg:text-[14px]">{{ error }}</p>
    <div v-else-if="visible.length === 0" class="rounded-card border border-line bg-surface p-8 text-center text-[13px] text-muted lg:text-[14px]">
      No hay movimientos para este filtro.
    </div>

    <!-- Capped at 8 rows on desktop before this scrolls internally (mobile keeps its normal
         full-page scroll, unbounded, exactly as before — the cap is lg:-only). 672px is
         measured, not guessed: each row is 74.5px plus the lg:space-y-2.5 (10px) gap between
         them, so 8 rows need ~666px — verified with Playwright against a history of 12 rows. -->
    <div v-else class="space-y-2 lg:space-y-2.5 lg:max-h-[672px] lg:overflow-y-auto lg:pr-1">
      <div
        v-for="t in visible"
        :key="t.id"
        class="flex items-center gap-3 rounded-[10px] border border-line bg-surface px-3 py-3 lg:px-4 lg:py-4"
      >
        <span class="size-2 rounded" :style="{ backgroundColor: categoryColor(t.category) }"></span>
        <div class="min-w-0 flex-1">
          <p class="text-[13px] font-bold text-ink lg:text-[15px]">{{ rowTitle(t) }}</p>
          <p class="text-[11px] text-muted lg:text-[12px]">{{ formatDate(t.registeredAt) }} · {{ typeLabel(t.type) }}</p>
        </div>
        <span class="text-[13px] font-bold lg:text-[15px]" :class="amountClass(t.type)">
          {{ t.type === 'INCOME' ? '+' : '-' }} {{ formatMoney(t.amount) }}
        </span>
        <button
          v-if="isDeletable(t)"
          type="button"
          class="shrink-0 text-muted transition-colors hover:text-expense"
          aria-label="Eliminar movimiento"
          @click="onDelete(t)"
        >
          <span class="block size-4 [&_svg]:size-full" aria-hidden="true" v-html="iconTrash"></span>
        </button>
      </div>
    </div>

    <AppFab @click="router.push({ name: 'transaction-new' })" />
  </div>
</template>

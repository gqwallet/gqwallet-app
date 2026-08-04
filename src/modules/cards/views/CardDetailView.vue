<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCardDetail } from '../composables/useCardDetail';
import CreditCardVisual from '../components/CreditCardVisual.vue';
import AppButton from '@/shared/components/AppButton.vue';
import { formatMoney } from '@/shared/util/money';
import { daysUntil, formatDateOnly, formatInstant } from '@/shared/util/dates';
import { dayOfMonth } from '@/shared/util/billingCycle';
import { categoryLabel } from '@/shared/domain/categories';
import type { Transaction } from '@/modules/transactions/types/Transaction';

const route = useRoute();
const router = useRouter();
const cardId = route.params.id as string;
const { card, linkedTransactions, linkedTotal, nextBilling, amountDue, hasOutstandingBalance, loading, error, fetch, removeCard } = useCardDetail(cardId);

// linkedTotal only nets EXPENSE/CARD_PAYMENT rows, but a payment can legitimately be larger
// than the raw expenses it settles (it also covers the seguro de desgravamen surcharge, which
// has no ledger row of its own) — capping here keeps available credit from reading above the
// card's own credit line when that happens.
const available = computed(() =>
  card.value ? Math.min(card.value.creditLine, card.value.creditLine - linkedTotal.value) : 0,
);

// FR-018: the due date of the cycle currently accruing, from the server projection. The
// card's own paymentDueDate is the raw registration-time date and goes stale immediately —
// showing it made an active card read as "Vencido" with a due date months in the past.
const currentDueDate = computed(() => nextBilling.value?.paymentDueDate ?? null);

// Desktop-only field (Figma node 139:41) — not shown on mobile, so it's fine to derive here
// rather than promoting it to the composable.
const daysRemaining = computed(() => {
  if (!currentDueDate.value) return 0;
  return daysUntil(currentDueDate.value);
});

onMounted(fetch);

async function onDelete() {
  if (!confirm('¿Eliminar esta tarjeta? Los movimientos vinculados se conservarán sin tarjeta.')) return;
  await removeCard();
  router.push({ name: 'cards' });
}

function goToEdit() {
  router.push({ name: 'card-edit', params: { id: cardId } });
}

function goToNewTransaction() {
  router.push({ name: 'transaction-new', query: { cardId } });
}

function goToPayCard() {
  router.push({ name: 'card-pay', params: { id: cardId } });
}

// A payment linked to the card has no category — name the action instead.
function linkedTitle(transaction: Transaction): string {
  return transaction.type === 'CARD_PAYMENT' ? 'Pago de tarjeta' : categoryLabel(transaction.category);
}
</script>

<template>
  <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando…</p>
  <p v-else-if="error" class="text-[13px] text-expense lg:text-[14px]">{{ error }}</p>

  <div v-else-if="card">
    <!-- Mobile / tablet: single column, unchanged below lg (screen 09) -->
    <div class="mx-auto max-w-md lg:hidden">
      <CreditCardVisual :card="card" />

      <div class="mt-4 rounded-card border border-line bg-surface p-4">
        <p class="mb-2 text-[14px] font-bold text-ink">Información de la tarjeta</p>
        <dl class="text-[13px]">
          <div class="flex justify-between border-t border-line py-2">
            <dt class="text-muted">Banco</dt>
            <dd class="font-medium text-ink">{{ card.bankName }}</dd>
          </div>
          <div class="flex justify-between border-t border-line py-2">
            <dt class="text-muted">Línea de crédito</dt>
            <dd class="font-medium text-ink">{{ formatMoney(card.creditLine) }}</dd>
          </div>
          <div class="flex justify-between border-t border-line py-2">
            <dt class="text-muted">Crédito disponible</dt>
            <dd class="font-medium text-ink">{{ formatMoney(available) }}</dd>
          </div>
          <div class="flex justify-between border-t border-line py-2">
            <dt class="text-muted">Fecha límite</dt>
            <dd class="font-medium text-ink">{{ currentDueDate ? formatDateOnly(currentDueDate) : '—' }}</dd>
          </div>
          <div v-if="card.insurancePercentage != null" class="flex justify-between border-t border-line py-2">
            <dt class="text-muted">Seguro desgravamen</dt>
            <dd class="font-medium text-ink">{{ card.insurancePercentage }}%</dd>
          </div>
          <div class="flex justify-between border-t border-line py-2">
            <dt class="text-muted">Monto a pagar{{ card.insurancePercentage != null ? ' (aproximado)' : '' }}</dt>
            <dd class="font-medium text-ink">{{ amountDue != null ? formatMoney(amountDue) : '—' }}</dd>
          </div>
        </dl>
      </div>

      <div class="mt-4 space-y-3">
        <AppButton variant="outline" @click="goToEdit">Editar tarjeta</AppButton>
        <AppButton variant="outline" @click="onDelete">Eliminar tarjeta</AppButton>
      </div>

      <div class="mt-6 rounded-card border border-line bg-surface p-4">
        <p class="text-[14px] font-bold text-ink">Gastos con {{ card.name }}</p>
        <p class="mb-2 text-[13px] text-muted">Total: {{ formatMoney(linkedTotal) }}</p>
        <p v-if="linkedTransactions.length === 0" class="border-t border-line pt-3 text-[13px] text-muted">
          Sin gastos vinculados todavía.
        </p>
        <div v-else>
          <div
            v-for="t in linkedTransactions"
            :key="t.id"
            class="flex items-center justify-between border-t border-line py-2 text-[13px]"
          >
            <span class="text-ink">{{ linkedTitle(t) }}</span>
            <span class="text-muted">{{ formatInstant(t.registeredAt) }}</span>
            <span class="font-bold" :class="t.type === 'CARD_PAYMENT' ? 'text-income' : 'text-expense'">
              {{ t.type === 'CARD_PAYMENT' ? '+' : '-' }} {{ formatMoney(t.amount) }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <AppButton @click="goToNewTransaction">+ Registrar gasto con esta tarjeta</AppButton>
        <AppButton variant="outline" :disabled="!hasOutstandingBalance" @click="goToPayCard">
          {{ hasOutstandingBalance ? 'Registrar pago de esta tarjeta' : 'Sin saldo pendiente' }}
        </AppButton>
      </div>
    </div>

    <!-- Desktop: two columns (Figma node 139:2, "Desktop / 08 – Detalle Tarjeta") -->
    <div class="hidden lg:grid lg:max-w-6xl lg:grid-cols-2 lg:items-start lg:gap-6 lg:mx-auto">
      <!-- Left col: card visual + info -->
      <div>
        <CreditCardVisual :card="card" />

        <div class="mt-5 rounded-card border border-line bg-surface p-5">
          <p class="mb-1 text-[16px] font-bold text-ink">Información de la tarjeta</p>
          <dl class="text-[14px]">
            <div class="flex justify-between border-t border-line py-2.5">
              <dt class="text-muted">Banco emisor</dt>
              <dd class="font-bold text-ink">{{ card.bankName }}</dd>
            </div>
            <div class="flex justify-between border-t border-line py-2.5">
              <dt class="text-muted">Línea de crédito</dt>
              <dd class="font-bold text-ink">{{ formatMoney(card.creditLine) }}</dd>
            </div>
            <div class="flex justify-between border-t border-line py-2.5">
              <dt class="text-muted">Crédito disponible</dt>
              <dd class="font-bold text-ink">{{ formatMoney(available) }}</dd>
            </div>
            <div class="flex justify-between border-t border-line py-2.5">
              <dt class="text-muted">Facturación</dt>
              <dd class="font-bold text-ink">Día {{ dayOfMonth(card.billingDate) }} de cada mes</dd>
            </div>
            <div class="flex justify-between border-t border-line py-2.5">
              <dt class="text-muted">Fecha límite</dt>
              <dd class="font-bold text-ink">{{ currentDueDate ? formatDateOnly(currentDueDate) : '—' }}</dd>
            </div>
            <div class="flex justify-between border-t border-line py-2.5">
              <dt class="text-muted">Días restantes</dt>
              <dd class="font-bold text-ink">{{ daysRemaining >= 0 ? `${daysRemaining} días` : 'Vencido' }}</dd>
            </div>
            <div v-if="card.insurancePercentage != null" class="flex justify-between border-t border-line py-2.5">
              <dt class="text-muted">Seguro desgravamen</dt>
              <dd class="font-bold text-ink">{{ card.insurancePercentage }}%</dd>
            </div>
            <div class="flex justify-between border-t border-line py-2.5">
              <dt class="text-muted">Monto a pagar{{ card.insurancePercentage != null ? ' (aproximado)' : '' }}</dt>
              <dd class="font-bold text-ink">{{ amountDue != null ? formatMoney(amountDue) : '—' }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Right col: actions + gastos -->
      <div>
        <div class="rounded-card border border-line bg-surface p-5">
          <p class="mb-1 text-[16px] font-bold text-ink">Acciones</p>
          <div class="space-y-3 border-t border-line pt-4">
            <AppButton variant="outline" @click="goToEdit">Editar tarjeta</AppButton>
            <AppButton variant="outline" @click="onDelete">Eliminar tarjeta</AppButton>
          </div>
        </div>

        <div class="mt-5 rounded-card border border-line bg-surface p-5">
          <p class="text-[16px] font-bold text-ink">Gastos con {{ card.name }}</p>
          <p class="mb-3 text-[13px] text-muted">Total: {{ formatMoney(linkedTotal) }} de {{ formatMoney(card.creditLine) }}</p>

          <template v-if="linkedTransactions.length > 0">
            <div class="grid grid-cols-[1fr_auto_auto] gap-x-4 border-t border-line pb-2 pt-3 text-[11px] font-bold text-muted">
              <span>Concepto</span>
              <span>Fecha</span>
              <span class="text-right">Monto</span>
            </div>
            <div
              v-for="t in linkedTransactions"
              :key="t.id"
              class="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-t border-line py-2.5 text-[13px]"
            >
              <span class="text-ink">{{ linkedTitle(t) }}</span>
              <span class="text-muted">{{ formatInstant(t.registeredAt) }}</span>
              <span class="text-right font-bold" :class="t.type === 'CARD_PAYMENT' ? 'text-income' : 'text-expense'">
                {{ t.type === 'CARD_PAYMENT' ? '+' : '-' }} {{ formatMoney(t.amount) }}
              </span>
            </div>
          </template>
          <p v-else class="border-t border-line pt-3 text-[13px] text-muted">Sin gastos vinculados todavía.</p>

          <button
            class="mt-4 h-11 w-full rounded-btn border border-brand-border bg-brand-bg text-[13px] font-bold text-brand"
            @click="goToNewTransaction"
          >
            + Registrar gasto con esta tarjeta
          </button>
          <button
            class="mt-2 h-11 w-full rounded-btn border border-line bg-surface text-[13px] font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!hasOutstandingBalance"
            @click="goToPayCard"
          >
            {{ hasOutstandingBalance ? 'Registrar pago de esta tarjeta' : 'Sin saldo pendiente' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

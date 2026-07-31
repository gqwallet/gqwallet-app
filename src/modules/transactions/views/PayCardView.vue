<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTransactions } from '../composables/useTransactions';
import { usePaymentCycleOptions } from '../composables/usePaymentCycleOptions';
import { useCardDetail } from '@/modules/cards/composables/useCardDetail';
import { formatMoney } from '@/shared/util/money';
import { formatDateOnly } from '@/shared/util/dates';
import AppTextField from '@/shared/components/AppTextField.vue';
import AppButton from '@/shared/components/AppButton.vue';

const route = useRoute();
const router = useRouter();
const cardId = route.params.id as string;

const { payCard } = useTransactions();
const { cycles, fetchCycles } = usePaymentCycleOptions();
const { card, fetch: fetchCard } = useCardDetail(cardId);

const amount = ref('');
const cycleClosingDate = ref('');
const description = ref('');
const saving = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  await Promise.all([fetchCard(), fetchCycles(cardId)]);
  // Default to the cycle the card is currently accruing — the first one the server offers.
  cycleClosingDate.value = cycles.value[0]?.closingDate ?? '';
});

const selectedCycle = computed(
  () => cycles.value.find((c) => c.closingDate === cycleClosingDate.value) ?? null,
);

// Every cycle now arrives already priced (FR-019), so this applies equally to the current and
// the next cycle — no longer a guard limited to whichever cycle happened to be preloaded.
const nothingOwedOnSelectedCycle = computed(
  () => !!selectedCycle.value && selectedCycle.value.amountDue <= 0,
);

// Keep the amount in sync with whichever cycle is selected. Without this, switching from a
// cycle with a balance to an empty one left the previous amount sitting in the field — the
// exact bug this view exists to prevent (confirming a payment against a cycle that owes
// nothing, using an amount that belonged to a different cycle).
watch(cycleClosingDate, () => {
  amount.value = selectedCycle.value && selectedCycle.value.amountDue > 0
    ? String(selectedCycle.value.amountDue)
    : '';
});

async function save() {
  if (!cycleClosingDate.value) {
    error.value = 'Selecciona el ciclo que estás pagando.';
    return;
  }
  if (!(Number(amount.value) > 0)) {
    error.value = 'Ingresa un monto mayor a cero.';
    return;
  }
  if (nothingOwedOnSelectedCycle.value) {
    error.value = 'No tienes saldo pendiente en este ciclo.';
    return;
  }
  saving.value = true;
  error.value = null;
  try {
    await payCard(cardId, {
      amount: Number(amount.value),
      cycleClosingDate: cycleClosingDate.value,
      description: description.value.trim() || null,
    });
    router.push({ name: 'card-detail', params: { id: cardId } });
  } catch (err) {
    // Surfaces the backend's own message (e.g. "payment exceeds the outstanding balance
    // of ...") — the only source of truth for a cycle we can't price on the client, like
    // the next one, which has no preloaded amount due to validate against locally.
    const backendMessage = (err as { response?: { data?: unknown } })?.response?.data;
    error.value = typeof backendMessage === 'string' && backendMessage
      ? backendMessage
      : 'No se pudo registrar el pago. Revisa el monto y el ciclo.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-md lg:max-w-lg">
    <div v-if="card" class="mb-4 rounded-card border border-line bg-surface p-4 lg:mb-5">
      <div class="flex items-center gap-3">
        <span class="w-1.5 shrink-0 self-stretch rounded-full" :style="{ backgroundColor: card.color }"></span>
        <div>
          <p class="text-[13px] font-bold text-ink lg:text-[14px]">{{ card.name }}</p>
          <p class="text-[11px] text-muted lg:text-[12px]">
            Por pagar: {{ selectedCycle ? formatMoney(selectedCycle.amountDue) : '—' }}
          </p>
        </div>
      </div>
    </div>

    <form class="space-y-4 lg:space-y-5" @submit.prevent="save">
      <AppTextField
        v-model="amount"
        label="Monto a pagar (S/.)"
        type="number"
        step="0.01"
        placeholder="0.00"
        :max="selectedCycle && selectedCycle.amountDue > 0 ? String(selectedCycle.amountDue) : undefined"
      />

      <label v-if="cycles.length > 0" class="block">
        <span class="mb-1 block text-[11px] font-medium text-muted lg:text-[12px]">¿Qué ciclo estás pagando?</span>
        <select
          v-model="cycleClosingDate"
          class="h-11 w-full rounded-btn border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-ink lg:h-12 lg:text-[15px]"
        >
          <option value="" disabled>Selecciona un ciclo</option>
          <option
            v-for="(cycle, i) in cycles"
            :key="cycle.closingDate"
            :value="cycle.closingDate"
            :disabled="cycle.amountDue <= 0"
          >
            {{ i === 0 ? 'Ciclo actual' : 'Próximo ciclo' }} · vence {{ formatDateOnly(cycle.paymentDueDate) }}
            {{ cycle.amountDue > 0 ? `· ${formatMoney(cycle.amountDue)}` : '· sin saldo pendiente' }}
          </option>
        </select>
        <p v-if="selectedCycle" class="mt-1 text-[11px] text-muted lg:text-[12px]">
          Cierra el {{ formatDateOnly(selectedCycle.closingDate) }}
        </p>
      </label>

      <AppTextField v-model="description" label="Descripción (opcional)" placeholder="Pago desde cuenta de ahorros" :maxlength="120" />

      <p v-if="nothingOwedOnSelectedCycle" class="text-[12px] text-muted lg:text-[13px]">
        No tienes saldo pendiente en este ciclo — no hay nada que pagar.
      </p>
      <p v-else-if="error" class="text-[12px] text-expense lg:text-[13px]">{{ error }}</p>

      <AppButton type="submit" :disabled="saving || nothingOwedOnSelectedCycle">{{ saving ? 'Registrando…' : 'Confirmar pago' }}</AppButton>
      <AppButton variant="outline" @click="router.back()">Cancelar</AppButton>
    </form>
  </div>
</template>

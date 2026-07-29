<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTransactions } from '../composables/useTransactions';
import { useBillingCycleOptions } from '../composables/useBillingCycleOptions';
import { useCardDetail } from '@/modules/cards/composables/useCardDetail';
import { formatMoney } from '@/shared/util/money';
import { formatDateOnly } from '@/shared/util/dates';
import AppTextField from '@/shared/components/AppTextField.vue';
import AppButton from '@/shared/components/AppButton.vue';

const route = useRoute();
const router = useRouter();
const cardId = route.params.id as string;

const { payCard } = useTransactions();
const { cycles, fetchCycles } = useBillingCycleOptions();
const { card, nextBilling, amountDue, fetch: fetchCard } = useCardDetail(cardId);

const amount = ref('');
const cycleClosingDate = ref('');
const description = ref('');
const saving = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  await Promise.all([fetchCard(), fetchCycles(cardId)]);
  // Default to the cycle the card is currently accruing, and prefill what it owes — the
  // overwhelmingly common case is settling the statement in full.
  cycleClosingDate.value = nextBilling.value?.billingDate ?? cycles.value[0]?.closingDate ?? '';
  if (amountDue.value != null && amountDue.value > 0) amount.value = String(amountDue.value);
});

const selectedCycle = computed(
  () => cycles.value.find((c) => c.closingDate === cycleClosingDate.value) ?? null,
);

async function save() {
  if (!cycleClosingDate.value) {
    error.value = 'Selecciona el ciclo que estás pagando.';
    return;
  }
  if (!(Number(amount.value) > 0)) {
    error.value = 'Ingresa un monto mayor a cero.';
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
  } catch {
    error.value = 'No se pudo registrar el pago. Revisa el monto y el ciclo.';
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
            Por pagar: {{ amountDue != null ? formatMoney(amountDue) : '—' }}
          </p>
        </div>
      </div>
    </div>

    <form class="space-y-4 lg:space-y-5" @submit.prevent="save">
      <AppTextField v-model="amount" label="Monto a pagar (S/.)" type="number" step="0.01" placeholder="0.00" />

      <label v-if="cycles.length > 0" class="block">
        <span class="mb-1 block text-[11px] font-medium text-muted lg:text-[12px]">¿Qué ciclo estás pagando?</span>
        <select
          v-model="cycleClosingDate"
          class="h-11 w-full rounded-btn border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-ink lg:h-12 lg:text-[15px]"
        >
          <option value="" disabled>Selecciona un ciclo</option>
          <option v-for="(cycle, i) in cycles" :key="cycle.closingDate" :value="cycle.closingDate">
            {{ i === 0 ? 'Ciclo actual' : 'Próximo ciclo' }} · vence {{ formatDateOnly(cycle.paymentDueDate) }}
          </option>
        </select>
        <p v-if="selectedCycle" class="mt-1 text-[11px] text-muted lg:text-[12px]">
          Cierra el {{ formatDateOnly(selectedCycle.closingDate) }}
        </p>
      </label>

      <AppTextField v-model="description" label="Descripción (opcional)" placeholder="Pago desde cuenta de ahorros" :maxlength="120" />

      <p v-if="error" class="text-[12px] text-expense lg:text-[13px]">{{ error }}</p>

      <AppButton type="submit" :disabled="saving">{{ saving ? 'Registrando…' : 'Confirmar pago' }}</AppButton>
      <AppButton variant="outline" @click="router.back()">Cancelar</AppButton>
    </form>
  </div>
</template>

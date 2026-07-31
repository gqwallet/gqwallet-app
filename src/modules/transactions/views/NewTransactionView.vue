<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTransactions } from '../composables/useTransactions';
import { useCategories } from '../composables/useCategories';
import { useCardOptions } from '../composables/useCardOptions';
import { useBillingCycleOptions } from '../composables/useBillingCycleOptions';
import { categoryLabel } from '@/shared/domain/categories';
import type { CategoryCode } from '@/shared/domain/categories';
import { formatMoney } from '@/shared/util/money';
import { formatDateOnly } from '@/shared/util/dates';
import type { TransactionType } from '../types/Transaction';
import AppTextField from '@/shared/components/AppTextField.vue';
import AppButton from '@/shared/components/AppButton.vue';

const route = useRoute();
const router = useRouter();
const { registerTransaction, getAvailableCredit } = useTransactions();
const { categories, fetchCategories } = useCategories();
const { cards, fetchCardOptions } = useCardOptions();
const { cycles, fetchCycles, clearCycles } = useBillingCycleOptions();

const type = ref<TransactionType>('EXPENSE');
const amount = ref('');
const category = ref<CategoryCode | ''>('');
const description = ref('');
const linkCard = ref(false);
const cardId = ref<string>((route.query.cardId as string) ?? '');
const cycleClosingDate = ref('');
const saving = ref(false);
const error = ref<string | null>(null);
const availableCredit = ref<number | null>(null);

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchCardOptions()]);
  if (cardId.value) linkCard.value = true;
});

// UX-only preventive check (the backend is the real enforcer, see FR credit-limit rule):
// re-fetch whenever the selected card changes, so the hint always reflects that card.
// FR-018: the cycles are per-card too, so they reload together and default to the current
// one — the option the vast majority of movements belong to.
watch(cardId, async (id) => {
  if (!id) {
    availableCredit.value = null;
    cycleClosingDate.value = '';
    clearCycles();
    return;
  }
  const [credit] = await Promise.all([getAvailableCredit(id), fetchCycles(id)]);
  availableCredit.value = credit;
  cycleClosingDate.value = cycles.value[0]?.closingDate ?? '';
}, { immediate: true });

const exceedsAvailableCredit = computed(() =>
  linkCard.value && availableCredit.value != null && Number(amount.value) > availableCredit.value,
);

const isLinkedToCard = computed(() => type.value === 'EXPENSE' && linkCard.value && !!cardId.value);

async function save() {
  if (exceedsAvailableCredit.value) {
    error.value = 'El monto supera el crédito disponible de la tarjeta seleccionada.';
    return;
  }
  if (isLinkedToCard.value && !cycleClosingDate.value) {
    error.value = 'Selecciona en qué ciclo se pagará este gasto.';
    return;
  }
  saving.value = true;
  error.value = null;
  try {
    await registerTransaction({
      amount: Number(amount.value),
      type: type.value,
      category: category.value as CategoryCode,
      cardId: isLinkedToCard.value ? cardId.value : null,
      cycleClosingDate: isLinkedToCard.value ? cycleClosingDate.value : null,
      description: description.value.trim() || null,
    });
    router.push({ name: 'history' });
  } catch {
    error.value = 'No se pudo registrar el movimiento. Revisa el monto y la categoría.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-md lg:max-w-lg">
    <!-- Ingreso / Gasto toggle -->
    <div class="mb-4 grid grid-cols-2 gap-2 rounded-btn border border-line bg-surface p-1 lg:mb-5 lg:p-1.5">
      <button
        type="button"
        class="rounded-btn py-2 text-[14px] font-medium lg:py-2.5 lg:text-[15px]"
        :class="type === 'INCOME' ? 'bg-ink text-white' : 'text-muted'"
        @click="type = 'INCOME'"
      >
        Ingreso
      </button>
      <button
        type="button"
        class="rounded-btn py-2 text-[14px] font-medium lg:py-2.5 lg:text-[15px]"
        :class="type === 'EXPENSE' ? 'bg-ink text-white' : 'text-muted'"
        @click="type = 'EXPENSE'"
      >
        Gasto
      </button>
    </div>

    <form class="space-y-4 lg:space-y-5" @submit.prevent="save">
      <AppTextField v-model="amount" label="Monto (S/.)" type="number" step="0.01" placeholder="0.00" />

      <label class="block">
        <span class="mb-1 block text-[11px] font-medium text-muted lg:text-[12px]">Categoría</span>
        <select
          v-model="category"
          class="h-11 w-full rounded-btn border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-ink lg:h-12 lg:text-[15px]"
        >
          <option value="" disabled>Selecciona una categoría</option>
          <option v-for="c in categories" :key="c" :value="c">{{ categoryLabel(c) }}</option>
        </select>
      </label>

      <AppTextField v-model="description" label="Descripción (opcional)" placeholder="Almuerzo con el equipo" :maxlength="120" />

      <!-- Card link only applies to expenses (FR-008) -->
      <div v-if="type === 'EXPENSE'" class="border-t border-line pt-4 lg:pt-5">
        <label class="flex items-center justify-between">
          <span class="text-[13px] text-ink lg:text-[14px]">Vincular a tarjeta de crédito</span>
          <input v-model="linkCard" type="checkbox" class="size-5 accent-[color:var(--color-ink)] lg:size-6" :disabled="cards.length === 0" />
        </label>
        <p v-if="cards.length === 0" class="mt-1 text-[11px] text-muted lg:text-[12px]">Registra una tarjeta primero para poder vincular.</p>

        <label v-if="linkCard && cards.length > 0" class="mt-3 block">
          <span class="mb-1 block text-[11px] font-medium text-muted lg:text-[12px]">Tarjeta seleccionada</span>
          <select
            v-model="cardId"
            class="h-11 w-full rounded-btn border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-ink lg:h-12 lg:text-[15px]"
          >
            <option value="" disabled>Selecciona una tarjeta</option>
            <option v-for="card in cards" :key="card.id" :value="card.id">{{ card.name }}</option>
          </select>
          <p v-if="availableCredit != null" class="mt-1 text-[11px] text-muted lg:text-[12px]">
            Disponible: {{ formatMoney(availableCredit) }}
          </p>
        </label>

        <!-- FR-018: which statement this expense will be settled in — current or next only -->
        <label v-if="linkCard && cycles.length > 0" class="mt-3 block">
          <span class="mb-1 block text-[11px] font-medium text-muted lg:text-[12px]">¿En qué ciclo lo pagarás?</span>
          <select
            v-model="cycleClosingDate"
            class="h-11 w-full rounded-btn border border-line bg-surface px-3 text-[14px] text-ink outline-none focus:border-ink lg:h-12 lg:text-[15px]"
          >
            <option value="" disabled>Selecciona un ciclo</option>
            <option v-for="(cycle, i) in cycles" :key="cycle.closingDate" :value="cycle.closingDate">
              {{ i === 0 ? 'Ciclo actual' : 'Próximo ciclo' }} · vence {{ formatDateOnly(cycle.paymentDueDate) }}
            </option>
          </select>
          <p class="mt-1 text-[11px] text-muted lg:text-[12px]">
            Cierra el {{ formatDateOnly(cycles.find((c) => c.closingDate === cycleClosingDate)?.closingDate ?? cycles[0].closingDate) }}
          </p>
        </label>
      </div>

      <p v-if="exceedsAvailableCredit" class="text-[12px] text-expense lg:text-[13px]">
        El monto supera el crédito disponible de esta tarjeta.
      </p>
      <p v-else-if="error" class="text-[12px] text-expense lg:text-[13px]">{{ error }}</p>

      <AppButton type="submit" :disabled="saving || exceedsAvailableCredit">{{ saving ? 'Registrando…' : 'Confirmar registro' }}</AppButton>
      <AppButton variant="outline" @click="router.back()">Cancelar</AppButton>
    </form>
  </div>
</template>

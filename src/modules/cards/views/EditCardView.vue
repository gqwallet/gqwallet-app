<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { cardsService } from '../services/cardsService';
import { composeCycleDates, dayOfMonth } from '@/shared/util/billingCycle';
import AppTextField from '@/shared/components/AppTextField.vue';
import AppButton from '@/shared/components/AppButton.vue';

// FR-005: update a card. billingDate and paymentDueDate are both freely editable.
const route = useRoute();
const router = useRouter();
const cardId = route.params.id as string;

const name = ref('');
const bankName = ref('');
const creditLine = ref('');
const billingDay = ref('');
const paymentDay = ref('');
const hasInsurance = ref(false);
const insurancePercentage = ref('');
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const card = await cardsService.get(cardId);
    name.value = card.name;
    bankName.value = card.bankName;
    creditLine.value = String(card.creditLine);
    billingDay.value = String(dayOfMonth(card.billingDate));
    paymentDay.value = String(dayOfMonth(card.paymentDueDate));
    hasInsurance.value = card.insurancePercentage != null;
    insurancePercentage.value = card.insurancePercentage != null ? String(card.insurancePercentage) : '';
  } catch {
    error.value = 'No se pudo cargar la tarjeta';
  } finally {
    loading.value = false;
  }
});

async function save() {
  saving.value = true;
  error.value = null;
  try {
    const { billingDate, paymentDueDate } = composeCycleDates(Number(billingDay.value), Number(paymentDay.value));
    await cardsService.update(cardId, {
      name: name.value,
      bankName: bankName.value,
      creditLine: Number(creditLine.value),
      billingDate: billingDate,
      paymentDueDate: paymentDueDate,
      insurancePercentage: hasInsurance.value ? Number(insurancePercentage.value) : null,
    });
    router.push({ name: 'card-detail', params: { id: cardId } });
  } catch {
    error.value = 'No se pudieron guardar los cambios';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-md lg:max-w-lg">
    <p v-if="loading" class="text-[13px] text-muted lg:text-[14px]">Cargando…</p>
    <form v-else class="space-y-4 lg:space-y-5" @submit.prevent="save">
      <AppTextField v-model="name" label="Nombre de la tarjeta" />
      <AppTextField v-model="bankName" label="Banco emisor" />
      <AppTextField v-model="creditLine" label="Línea de crédito (S/.)" type="number" step="0.01" />
      <AppTextField v-model="billingDay" label="Día de facturación" type="number" />
      <AppTextField v-model="paymentDay" label="Día límite de pago" type="number" />

      <div class="border-t border-line pt-4 lg:pt-5">
        <label class="flex items-center justify-between">
          <span class="text-[13px] text-ink lg:text-[14px]">¿Tiene seguro desgravamen?</span>
          <input v-model="hasInsurance" type="checkbox" class="size-5 accent-[color:var(--color-ink)] lg:size-6" />
        </label>
        <AppTextField
          v-if="hasInsurance"
          v-model="insurancePercentage"
          label="Seguro desgravamen (%)"
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="3.5"
          class="mt-3"
        />
      </div>

      <p v-if="error" class="text-[12px] text-expense lg:text-[13px]">{{ error }}</p>

      <AppButton type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar cambios' }}</AppButton>
    </form>
  </div>
</template>

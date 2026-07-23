<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCards } from '../composables/useCards';
import { composeCycleDates } from '@/shared/util/billingCycle';
import { CARD_COLORS } from '../types/Card';
import AppTextField from '@/shared/components/AppTextField.vue';
import AppButton from '@/shared/components/AppButton.vue';

const router = useRouter();
const { registerCard } = useCards();

const name = ref('');
const bankName = ref('');
const color = ref<string>(CARD_COLORS[0]);
const creditLine = ref('');
const billingDay = ref('');
const paymentDay = ref('');
const hasInsurance = ref(false);
const insurancePercentage = ref('');
const saving = ref(false);
const error = ref<string | null>(null);

async function save() {
  saving.value = true;
  error.value = null;
  try {
    const { billingDate, paymentDueDate } = composeCycleDates(Number(billingDay.value), Number(paymentDay.value));
    await registerCard({
      name: name.value,
      bankName: bankName.value,
      creditLine: Number(creditLine.value),
      billingDate,
      paymentDueDate,
      color: color.value,
      insurancePercentage: hasInsurance.value ? Number(insurancePercentage.value) : null,
    });
    router.push({ name: 'cards' });
  } catch {
    error.value = 'No se pudo guardar la tarjeta. Revisa los datos (la fecha de pago debe ser posterior a la de facturación).';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-md lg:max-w-lg">
    <form class="space-y-4 lg:space-y-5" @submit.prevent="save">
      <AppTextField v-model="name" label="Nombre de la tarjeta" placeholder="Visa Gold" />
      <AppTextField v-model="bankName" label="Banco emisor" placeholder="BCP" />

      <div>
        <span class="mb-2 block text-[11px] font-medium text-muted lg:text-[12px]">Color identificador</span>
        <div class="flex gap-3">
          <button
            v-for="c in CARD_COLORS"
            :key="c"
            type="button"
            class="size-9 rounded-full ring-offset-2 transition lg:size-10"
            :class="color === c ? 'ring-2 ring-ink' : ''"
            :style="{ backgroundColor: c }"
            :aria-label="`Color ${c}`"
            @click="color = c"
          ></button>
        </div>
      </div>

      <AppTextField v-model="creditLine" label="Línea de crédito (S/.)" type="number" step="0.01" placeholder="5000" />
      <AppTextField v-model="billingDay" label="Día de facturación" type="number" min="1" max="31" placeholder="15" />
      <AppTextField v-model="paymentDay" label="Día límite de pago" type="number" min="1" max="31" placeholder="5" />

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

      <AppButton type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar tarjeta' }}</AppButton>
    </form>
  </div>
</template>

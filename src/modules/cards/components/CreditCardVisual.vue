<script setup lang="ts">
import type { Card } from '../types/Card';
import { formatMoney } from '@/shared/util/money';

defineProps<{ card: Card }>();
</script>

<template>
  <!-- No card number is rendered: the domain stores none (NFR-002, privacy by design). -->
  <div
    class="relative flex h-[190px] flex-col justify-between overflow-hidden rounded-2xl p-5 text-white lg:h-[215px] lg:p-6"
    :style="{ backgroundColor: card.color }"
  >
    <div
      class="pointer-events-none absolute -right-10 -top-16 size-52 rounded-full bg-white/10"
    ></div>
    <div class="pointer-events-none absolute right-10 top-24 size-40 rounded-full bg-white/10"></div>

    <div class="flex items-start justify-between">
      <div class="h-8 w-10 rounded-md lg:h-9 lg:w-11" style="background-color: #e5cc66"></div>
      <span class="text-[12px] font-bold lg:text-[14px]">{{ card.bankName }}</span>
    </div>

    <div>
      <p class="text-[14px] font-bold uppercase tracking-wide lg:text-[17px]">{{ card.name }}</p>
      <p class="mt-3 text-[9px] text-white/65 lg:text-[11px]">Línea de crédito</p>
      <p class="text-[13px] font-bold lg:text-[16px]">{{ formatMoney(card.creditLine) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Floating action button (bottom-right) used on list screens in the mockup.
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button
    class="fixed bottom-6 right-6 z-30 flex size-13 items-center justify-center rounded-full bg-ink text-[26px] leading-none text-white shadow-lg lg:bottom-10 lg:right-10 lg:size-14.5 lg:text-[30px]"
    aria-label="Agregar"
    @click="emit('click')"
  >
    +
  </button>
</template>

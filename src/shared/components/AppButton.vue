<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'outline';
    type?: 'button' | 'submit';
    disabled?: boolean;
    block?: boolean;
  }>(),
  { variant: 'primary', type: 'button', disabled: false, block: true },
);

const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center rounded-btn px-4 text-[13px] font-bold h-11 transition-colors disabled:opacity-50 disabled:cursor-not-allowed lg:h-12 lg:text-[14px]',
      block ? 'w-full' : '',
      variant === 'primary'
        ? 'bg-ink text-white hover:bg-ink/90'
        : 'bg-surface text-ink border border-line hover:bg-page',
    ]"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

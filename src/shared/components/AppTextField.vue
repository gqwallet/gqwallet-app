<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'date';
    placeholder?: string;
    step?: string;
    min?: string;
    max?: string;
    maxlength?: number;
    required?: boolean;
  }>(),
  { type: 'text', placeholder: '', step: undefined, min: undefined, max: undefined, maxlength: undefined, required: false },
);

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <label class="block">
    <span class="mb-1 block text-[11px] font-medium text-muted lg:text-[12px]">{{ label }}</span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :step="step"
      :min="min"
      :max="max"
      :maxlength="maxlength"
      :required="required"
      class="h-11 w-full rounded-btn border border-line bg-surface px-3 text-[14px] text-ink outline-none placeholder:text-muted focus:border-ink lg:h-12 lg:text-[15px]"
      @input="onInput"
    />
  </label>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  fieldId: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="space-y-1.5">
    <label :for="fieldId" class="block text-sm font-medium text-slate-800">
      {{ label }}
    </label>
    <slot />
    <p v-if="hint && !error" class="text-xs text-slate-500">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${fieldId}-error`" class="text-xs text-rose-600" role="alert">
      {{ error }}
    </p>
  </div>
</template>

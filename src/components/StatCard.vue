<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  hint: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm" role="status">
    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
      {{ label }}
    </p>
    <p class="mt-1 text-2xl font-semibold text-slate-900">
      {{ value }}
    </p>
    <p v-if="hint" class="mt-1 text-xs text-slate-600">
      {{ hint }}
    </p>
  </section>
</template>


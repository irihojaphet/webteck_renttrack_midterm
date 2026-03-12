<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <header class="mb-4">
    <h1 class="text-xl font-semibold text-slate-900">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="mt-1 text-sm text-slate-600">
      {{ subtitle }}
    </p>
  </header>
</template>


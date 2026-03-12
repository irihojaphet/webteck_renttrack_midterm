<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['action'])

function handleAction() {
  emit('action')
}
</script>

<template>
  <section class="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
    <h2 class="text-base font-semibold text-slate-900">
      {{ title }}
    </h2>
    <p v-if="description" class="mt-2 max-w-md text-sm text-slate-600">
      {{ description }}
    </p>
    <button
      v-if="actionLabel"
      type="button"
      class="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      @click="handleAction"
    >
      {{ actionLabel }}
    </button>
  </section>
</template>


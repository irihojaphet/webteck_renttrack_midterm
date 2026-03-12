<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['dismiss'])

const visibleItems = computed(() => props.items.filter((item) => !item.dismissed))

function dismiss(id) {
  emit('dismiss', id)
}
</script>

<template>
  <section
    class="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center space-y-2"
    aria-live="polite"
    aria-atomic="true"
  >
    <article
      v-for="item in visibleItems"
      :key="item.id"
      class="pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg"
      role="status"
    >
      <div class="mt-0.5 h-2 w-2 rounded-full" :class="item.kind === 'error' ? 'bg-red-500' : 'bg-emerald-500'"></div>
      <div class="flex-1">
        <p class="text-sm font-medium text-slate-900">
          {{ item.title }}
        </p>
        <p v-if="item.message" class="mt-1 text-xs text-slate-600">
          {{ item.message }}
        </p>
      </div>
      <button
        type="button"
        class="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        aria-label="Dismiss notification"
        @click="dismiss(item.id)"
      >
        ×
      </button>
    </article>
  </section>
</template>


<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const panelRef = ref(null)
let previousFocus = null

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    close()
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      panelRef.value?.querySelector('button, input, select, textarea')?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      previousFocus?.focus?.()
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      @click.self="close"
    >
      <section
        ref="panelRef"
        class="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="mb-4 flex items-center justify-between gap-4">
          <h2 class="text-xl font-semibold text-slate-950">
            {{ title }}
          </h2>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600"
            aria-label="Close dialog"
            @click="close"
          >
            Close
          </button>
        </header>
        <div class="space-y-4">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>

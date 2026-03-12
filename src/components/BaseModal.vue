<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'

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

const dialogRef = ref(null)
let lastFocusedElement = null

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    close()
  }
}

function trapFocus(event) {
  if (event.key !== 'Tab') return

  const dialog = dialogRef.value
  if (!dialog) return

  const focusable = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      lastFocusedElement = document.activeElement
      await nextTick()
      const dialog = dialogRef.value
      if (dialog) {
        const focusTarget =
          dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ||
          dialog
        focusTarget.focus()
      }
      document.addEventListener('keydown', onKeydown)
      document.addEventListener('keydown', trapFocus)
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.removeEventListener('keydown', trapFocus)
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus()
      }
    }
  },
  { immediate: false },
)

onMounted(() => {
  if (props.modelValue) {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('keydown', trapFocus)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('keydown', trapFocus)
})
</script>

<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4"
      role="presentation"
      @click.self="close"
    >
      <section
        ref="dialogRef"
        class="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg focus:outline-none"
        role="dialog"
        aria-modal="true"
        :aria-label="title || undefined"
      >
        <header class="mb-3 flex items-center justify-between gap-2">
          <h2 v-if="title" class="text-base font-semibold text-slate-900">
            {{ title }}
          </h2>
          <button
            type="button"
            class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            aria-label="Close"
            @click="close"
          >
            ×
          </button>
        </header>
        <div class="space-y-3 text-sm text-slate-700">
          <slot />
        </div>
        <footer class="mt-4 flex justify-end gap-2">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </teleport>
</template>


<script setup>
import { storeToRefs } from 'pinia'
import { useUiStore } from '../stores/ui'

const uiStore = useUiStore()
const { toasts } = storeToRefs(uiStore)
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2" aria-live="polite">
    <article
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto flex w-[min(92vw,28rem)] items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
      role="status"
    >
      <span
        class="mt-1 h-2.5 w-2.5 rounded-full"
        :class="toast.kind === 'error' ? 'bg-rose-500' : 'bg-emerald-500'"
      ></span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-950">
          {{ toast.title }}
        </p>
        <p v-if="toast.message" class="mt-1 text-sm text-slate-600">
          {{ toast.message }}
        </p>
      </div>
      <button
        type="button"
        class="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500"
        aria-label="Dismiss toast"
        @click="uiStore.dismissToast(toast.id)"
      >
        Dismiss
      </button>
    </article>
  </div>
</template>

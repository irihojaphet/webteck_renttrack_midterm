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
  tone: {
    type: String,
    default: 'indigo',
  },
})
</script>

<template>
  <section class="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm" role="status">
    <div class="mb-4 flex items-center justify-between">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {{ label }}
      </p>
      <span
        class="h-3 w-3 rounded-full"
        :class="{
          'bg-indigo-500': tone === 'indigo',
          'bg-emerald-500': tone === 'emerald',
          'bg-amber-500': tone === 'amber',
          'bg-slate-500': tone === 'slate',
        }"
      ></span>
    </div>
    <p class="mt-2 text-3xl font-semibold text-slate-950">
      {{ value }}
    </p>
    <p v-if="hint" class="mt-2 text-xs leading-5 text-slate-500">
      {{ hint }}
    </p>
  </section>
</template>

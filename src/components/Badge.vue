<script setup>
const props = defineProps({
  kind: {
    type: String,
    default: 'default',
  },
})

const tones = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  unpaid: 'bg-amber-50 text-amber-700 ring-amber-100',
  expired: 'bg-slate-100 text-slate-700 ring-slate-200',
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  occupied: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
  open: 'bg-amber-50 text-amber-700 ring-amber-100',
  inprogress: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  partial: 'bg-amber-50 text-amber-700 ring-amber-100',
  late: 'bg-rose-50 text-rose-700 ring-rose-100',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  ended: 'bg-slate-100 text-slate-700 ring-slate-200',
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function normalize(kind) {
  return String(kind || 'default').toLowerCase().replace(/[^a-z]/g, '')
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
    :class="tones[normalize(props.kind)] || tones.default"
  >
    {{ props.kind }}
  </span>
</template>

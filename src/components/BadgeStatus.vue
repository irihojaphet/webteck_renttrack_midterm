<script setup>
const props = defineProps({
  kind: {
    type: String,
    required: true,
  },
})

const classesByKind = {
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Partial: 'bg-amber-50 text-amber-700 border-amber-200',
  Late: 'bg-red-50 text-red-700 border-red-200',
  Open: 'bg-sky-50 text-sky-700 border-sky-200',
  InProgress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const labelByKind = {
  Paid: 'Paid',
  Partial: 'Partially paid',
  Late: 'Late',
  Open: 'Open',
  InProgress: 'In progress',
  Resolved: 'Resolved',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
    :class="classesByKind[props.kind] || 'bg-slate-50 text-slate-700 border-slate-200'"
  >
    {{ labelByKind[props.kind] || props.kind }}
  </span>
</template>


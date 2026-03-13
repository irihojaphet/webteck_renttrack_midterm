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
  imageSrc: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['action'])
</script>

<template>
  <section class="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
    <img
      v-if="imageSrc"
      :src="imageSrc"
      alt=""
      class="mb-5 h-32 w-auto"
    />
    <h2 class="text-lg font-semibold text-slate-950">
      {{ title }}
    </h2>
    <p v-if="description" class="mt-2 max-w-md text-sm leading-6 text-slate-600">
      {{ description }}
    </p>
    <button
      v-if="actionLabel"
      type="button"
      class="mt-4 inline-flex items-center rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </section>
</template>

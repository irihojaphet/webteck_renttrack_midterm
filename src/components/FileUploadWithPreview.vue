<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: '',
  },
  fieldId: {
    type: String,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: 'image/*',
  },
})

const emit = defineEmits(['update:modelValue'])

const previews = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : [],
)

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function onChange(event) {
  const files = Array.from(event.target.files || [])
  const encoded = await Promise.all(files.map((file) => fileToBase64(file)))
  emit('update:modelValue', props.multiple ? encoded : encoded[0] || '')
}
</script>

<template>
  <div class="space-y-3">
    <input
      :id="fieldId"
      :multiple="multiple"
      :accept="accept"
      type="file"
      class="block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
      @change="onChange"
    />
    <div v-if="previews.length" class="grid gap-3 sm:grid-cols-2">
      <img
        v-for="preview in previews"
        :key="preview"
        :src="preview"
        alt=""
        class="h-32 w-full rounded-2xl border border-slate-200 object-cover"
      />
    </div>
  </div>
</template>

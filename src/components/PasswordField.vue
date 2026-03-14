<script setup>
import { computed, ref } from 'vue'
import FormField from './FormField.vue'

defineOptions({
  name: 'PasswordField',
})

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  fieldId: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  autocomplete: {
    type: String,
    default: 'current-password',
  },
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const inputType = computed(() => (visible.value ? 'text' : 'password'))

function updateValue(event) {
  emit('update:modelValue', event.target.value)
}

function toggleVisibility() {
  visible.value = !visible.value
}
</script>

<template>
  <FormField :field-id="fieldId" :label="label" :error="error" :hint="hint">
    <div class="relative">
      <input
        :id="fieldId"
        :value="modelValue"
        :type="inputType"
        :autocomplete="autocomplete"
        class="block w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-900"
        :aria-invalid="error ? 'true' : 'false'"
        :aria-describedby="error ? `${fieldId}-error` : undefined"
        @input="updateValue"
      />
      <button
        type="button"
        class="absolute inset-y-0 right-2 inline-flex items-center rounded-xl px-2 text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        @click="toggleVisibility"
      >
        <svg
          v-if="!visible"
          aria-hidden="true"
          viewBox="0 0 24 24"
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg
          v-else
          aria-hidden="true"
          viewBox="0 0 24 24"
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m3 3 18 18" />
          <path d="M10.6 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.2-.9" />
          <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2" />
          <path d="M6.2 6.3C3.7 8 2 12 2 12a17.8 17.8 0 0 0 6.1 5.5" />
        </svg>
      </button>
    </div>
  </FormField>
</template>

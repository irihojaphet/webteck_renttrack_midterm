<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')

const fullNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const formError = ref('')
const isSubmitting = ref(false)

function validate() {
  fullNameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  formError.value = ''

  let ok = true
  if (!fullName.value.trim()) {
    fullNameError.value = 'Please enter your full name.'
    ok = false
  }
  if (!email.value.trim()) {
    emailError.value = 'Please enter your email address.'
    ok = false
  }
  if (!password.value) {
    passwordError.value = 'Please choose a password.'
    ok = false
  }
  return ok
}

async function handleSubmit(event) {
  event.preventDefault()
  if (!validate()) return

  isSubmitting.value = true
  formError.value = ''

  try {
    await auth.register(fullName.value, email.value, password.value)
    router.push('/tenant/dashboard')
  } catch (error) {
    formError.value =
      error instanceof Error
        ? error.message
        : 'We could not create your account. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <section
      class="w-full max-w-md rounded-xl border border-slate-200 bg-white px-6 py-8 shadow-sm"
      aria-labelledby="signup-title"
    >
      <header class="mb-6 text-center">
        <h1 id="signup-title" class="text-2xl font-semibold text-slate-900">Create a tenant account</h1>
        <p class="mt-2 text-sm text-slate-600">
          This creates a local tenant user in your browser only. Use the landlord demo account to manage properties.
        </p>
      </header>

      <form
        novalidate
        @submit="handleSubmit"
        class="space-y-4"
        aria-describedby="signup-error"
      >
        <div
          v-if="formError"
          id="signup-error"
          class="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {{ formError }}
        </div>

        <div class="space-y-1">
          <label for="full-name" class="block text-sm font-medium text-slate-800">Full name</label>
          <input
            id="full-name"
            v-model="fullName"
            type="text"
            name="full-name"
            autocomplete="name"
            class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="fullNameError ? 'true' : 'false'"
            aria-describedby="full-name-error"
          />
          <p
            v-if="fullNameError"
            id="full-name-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ fullNameError }}
          </p>
        </div>

        <div class="space-y-1">
          <label for="signup-email" class="block text-sm font-medium text-slate-800">Email address</label>
          <input
            id="signup-email"
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="emailError ? 'true' : 'false'"
            aria-describedby="signup-email-error"
          />
          <p
            v-if="emailError"
            id="signup-email-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ emailError }}
          </p>
        </div>

        <div class="space-y-1">
          <label for="signup-password" class="block text-sm font-medium text-slate-800">Password</label>
          <input
            id="signup-password"
            v-model="password"
            type="password"
            name="password"
            autocomplete="new-password"
            class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="passwordError ? 'true' : 'false'"
            aria-describedby="signup-password-error"
          />
          <p
            v-if="passwordError"
            id="signup-password-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ passwordError }}
          </p>
        </div>

        <button
          type="submit"
          class="mt-2 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">Create account</span>
          <span
            v-else
            class="inline-flex items-center gap-2"
          >
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              role="status"
              aria-label="Creating account"
            ></span>
            Creating…
          </span>
        </button>

        <p class="mt-2 text-center text-xs text-slate-600">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Sign in instead
          </router-link>
        </p>
      </form>
    </section>
  </main>
</template>


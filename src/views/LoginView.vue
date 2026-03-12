<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const formError = ref('')
const isSubmitting = ref(false)

const emailError = ref('')
const passwordError = ref('')

function validate() {
  emailError.value = ''
  passwordError.value = ''
  formError.value = ''

  let ok = true
  if (!email.value) {
    emailError.value = 'Please enter your email address.'
    ok = false
  }
  if (!password.value) {
    passwordError.value = 'Please enter your password.'
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
    await auth.login(email.value.trim(), password.value)
    const role = auth.role
    const redirect = route.query.redirect || null
    if (typeof redirect === 'string') {
      router.push(redirect)
      return
    }
    if (role.value === 'landlord') {
      router.push('/landlord/dashboard')
    } else if (role.value === 'tenant') {
      router.push('/tenant/dashboard')
    } else {
      router.push('/')
    }
  } catch (error) {
    formError.value =
      error instanceof Error
        ? error.message
        : 'We could not sign you in. Please check your details and try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <section
      class="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-8"
      aria-labelledby="login-title"
    >
      <header class="mb-6 text-center">
        <h1 id="login-title" class="text-2xl font-semibold text-slate-900">Sign in to RentTrack</h1>
        <p class="mt-2 text-sm text-slate-600">
          Demo accounts:
          <span class="font-mono text-xs block mt-1">
            landlord@example.com / landlord123<br />
            tenant@example.com / tenant123
          </span>
        </p>
      </header>

      <form
        novalidate
        @submit="handleSubmit"
        class="space-y-4"
        aria-describedby="login-error"
      >
        <div
          v-if="formError"
          id="login-error"
          class="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {{ formError }}
        </div>

        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-slate-800">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="emailError ? 'true' : 'false'"
            aria-describedby="email-error"
          />
          <p
            v-if="emailError"
            id="email-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ emailError }}
          </p>
        </div>

        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-slate-800">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="passwordError ? 'true' : 'false'"
            aria-describedby="password-error"
          />
          <p
            v-if="passwordError"
            id="password-error"
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
          <span v-if="!isSubmitting">Sign in</span>
          <span
            v-else
            class="inline-flex items-center gap-2"
          >
            <span
              class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              role="status"
              aria-label="Signing in"
            ></span>
            Signing in...
          </span>
        </button>
      </form>
    </section>
  </main>
</template>


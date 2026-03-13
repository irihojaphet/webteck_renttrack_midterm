<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import loginHero from '../assets/placeholders/login-hero.jpg'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const auth = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()

const credentials = reactive({
  email: '',
  password: '',
})
const errors = reactive({
  email: '',
  password: '',
  form: '',
})
const submitting = ref(false)

const demoAccounts = [
  {
    role: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    note: 'Creates landlords, manages plans, reads revenue and audit logs.',
  },
  {
    role: 'Landlord',
    email: 'landlord1@example.com',
    password: 'landlord123',
    note: 'Starts with an unpaid annual plan to demonstrate subscription gating.',
  },
  {
    role: 'Tenant',
    email: 'tenant1@example.com',
    password: 'tenant123',
    note: 'Can submit payment proof, open maintenance claims, and use chat threads.',
  },
]

function fillDemo(account) {
  credentials.email = account.email
  credentials.password = account.password
}

function validate() {
  errors.email = credentials.email ? '' : 'Enter your email address.'
  errors.password = credentials.password ? '' : 'Enter your password.'
  errors.form = ''
  return !errors.email && !errors.password
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    auth.login(credentials.email, credentials.password)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    if (redirect) {
      router.push(redirect)
      return
    }
    if (auth.role === 'admin') {
      router.push('/admin/dashboard')
      return
    }
    if (auth.role === 'landlord') {
      router.push('/landlord/dashboard')
      return
    }
    router.push('/tenant/dashboard')
  } catch (error) {
    errors.form = error.message || 'Unable to sign in.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-slate-100 px-4 py-10">
    <div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
      <section class="rounded-[36px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-600">
            RentTrack
          </p>
          <button
            type="button"
            class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            :aria-label="themeStore.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="themeStore.toggle"
          >
            {{ themeStore.mode === 'dark' ? '☼' : '☾' }}
          </button>
        </div>
        <h1 class="mt-4 text-4xl font-semibold text-slate-950">
          Property management for admins, landlords, and tenants.
        </h1>
        <img
          :src="loginHero"
          alt=""
          class="login-hero-image mt-8 h-[24rem] w-full rounded-[28px] border border-slate-200 object-cover"
        />
      </section>

      <section class="space-y-6">
        <div class="rounded-[32px] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
          <h2 class="text-2xl font-semibold text-slate-950">
            Sign in
          </h2>

          <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
            <div v-if="errors.form" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
              {{ errors.form }}
            </div>

            <div class="space-y-1.5">
              <label for="email" class="text-sm font-medium text-slate-800">Email</label>
              <input
                id="email"
                v-model="credentials.email"
                type="email"
                class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
                :aria-invalid="errors.email ? 'true' : 'false'"
                :aria-describedby="errors.email ? 'email-error' : undefined"
              />
              <p v-if="errors.email" id="email-error" class="text-xs text-rose-600" role="alert">
                {{ errors.email }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label for="password" class="text-sm font-medium text-slate-800">Password</label>
              <input
                id="password"
                v-model="credentials.password"
                type="password"
                class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900"
                :aria-invalid="errors.password ? 'true' : 'false'"
                :aria-describedby="errors.password ? 'password-error' : undefined"
              />
              <p v-if="errors.password" id="password-error" class="text-xs text-rose-600" role="alert">
                {{ errors.password }}
              </p>
            </div>

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
              :disabled="submitting"
            >
              {{ submitting ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
        </div>

        <div class="grid gap-4">
          <article
            v-for="account in demoAccounts"
            :key="account.email"
            class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {{ account.role }}
                </p>
                <p class="mt-2 font-mono text-sm text-slate-900">
                  {{ account.email }}
                </p>
                <p class="font-mono text-sm text-slate-900">
                  {{ account.password }}
                </p>
              </div>
              <button
                type="button"
                class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                @click="fillDemo(account)"
              >
                Use
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

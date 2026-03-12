<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const userRole = computed(() => auth.role)
const userName = computed(() => (auth.currentUser ? auth.currentUser.fullName : ''))

function goTo(path) {
  router.push(path)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-white border-b border-slate-200" role="banner">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 lg:hidden"
          aria-label="Go to dashboard"
          @click="userRole === 'landlord' ? goTo('/landlord/dashboard') : goTo('/tenant/dashboard')"
        >
          RT
        </button>
        <button
          type="button"
          class="hidden text-base font-semibold text-slate-900 lg:inline-flex"
          aria-label="RentTrack dashboard"
          @click="userRole === 'landlord' ? goTo('/landlord/dashboard') : goTo('/tenant/dashboard')"
        >
          RentTrack
        </button>
      </div>

      <div class="flex items-center gap-4">
        <p v-if="auth.isAuthenticated" class="hidden text-sm text-slate-600 sm:block">
          Signed in as
          <span class="font-medium text-slate-900">{{ userName }}</span>
          <span class="text-xs uppercase text-slate-500">
            ({{ userRole }})
          </span>
        </p>
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          @click="handleLogout"
        >
          Sign out
        </button>
      </div>
    </nav>
  </header>
</template>


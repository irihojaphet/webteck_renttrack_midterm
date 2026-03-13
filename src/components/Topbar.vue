<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const router = useRouter()
const auth = useAuthStore()
const notificationsStore = useNotificationsStore()

const initials = computed(() => {
  const name = auth.currentUser?.fullName || auth.currentUser?.email || 'RT'
  return name
    .split(' ')
    .map((chunk) => chunk[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})
const unreadNotifications = computed(
  () =>
    notificationsStore.items.filter((item) => item.recipientUserId === auth.currentUser?.id && !item.read).length,
)

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="border-b border-slate-200 bg-white/85 backdrop-blur">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          {{ auth.role || 'public' }}
        </p>
        <h2 class="mt-1 truncate text-2xl font-semibold text-slate-950">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          {{ subtitle }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 md:block">
          Notifications {{ unreadNotifications }}
        </div>
        <div class="hidden text-right sm:block">
          <p class="text-sm font-medium text-slate-900">
            {{ auth.currentUser?.fullName || auth.currentUser?.email }}
          </p>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Active session
          </p>
        </div>
        <div
          class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {{ initials }}
        </div>
        <button
          type="button"
          class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>

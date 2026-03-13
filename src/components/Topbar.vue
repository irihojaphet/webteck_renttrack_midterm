<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationsStore } from '../stores/notifications'
import { useThemeStore } from '../stores/theme'

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
const themeStore = useThemeStore()
const notificationsOpen = ref(false)

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
const myNotifications = computed(() =>
  notificationsStore.sortedItems.filter((item) => item.recipientUserId === auth.currentUser?.id),
)

function logout() {
  auth.logout()
  router.push('/login')
}

function toggleNotifications() {
  notificationsOpen.value = !notificationsOpen.value
}

function markRead(id) {
  notificationsStore.markRead(id)
}

function markAllRead() {
  notificationsStore.markAllReadForUser(auth.currentUser?.id)
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
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            @click="toggleNotifications"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M15 17H5.5a1 1 0 0 1-.8-1.6l1.1-1.5a4 4 0 0 0 .7-2.3V9.5a5.5 5.5 0 1 1 11 0v2.1a4 4 0 0 0 .7 2.3l1.1 1.5a1 1 0 0 1-.8 1.6H18" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
            <span>{{ unreadNotifications }}</span>
          </button>
          <div
            v-if="notificationsOpen"
            class="absolute right-0 z-20 mt-3 w-80 rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl"
          >
            <div class="mb-3 flex items-center justify-between gap-3">
              <h3 class="text-sm font-semibold text-slate-950">
                Notifications
              </h3>
              <button
                type="button"
                class="text-xs font-medium text-slate-500"
                @click="markAllRead"
              >
                Mark all read
              </button>
            </div>
            <div class="space-y-2">
              <article
                v-for="item in myNotifications.slice(0, 6)"
                :key="item.id"
                class="rounded-2xl border border-slate-200 px-3 py-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-slate-900">
                      {{ item.title }}
                    </p>
                    <p class="mt-1 text-xs leading-5 text-slate-500">
                      {{ item.message }}
                    </p>
                  </div>
                  <button
                    v-if="!item.read"
                    type="button"
                    class="text-xs font-medium text-slate-500"
                    @click="markRead(item.id)"
                  >
                    Read
                  </button>
                </div>
              </article>
              <p v-if="!myNotifications.length" class="text-sm text-slate-500">
                No notifications
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          :aria-label="themeStore.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="themeStore.toggle"
        >
          {{ themeStore.mode === 'dark' ? '☼' : '☾' }}
        </button>
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

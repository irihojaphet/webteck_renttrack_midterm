<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppNavbar from './AppNavbar.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const links = computed(() => {
  if (!auth.role) return []
  if (auth.role === 'landlord') {
    return [
      { to: '/landlord/dashboard', label: 'Dashboard' },
      { to: '/landlord/properties', label: 'Properties' },
      { to: '/landlord/tenants', label: 'Tenants' },
      { to: '/landlord/leases', label: 'Leases' },
      { to: '/landlord/payments', label: 'Payments' },
      { to: '/landlord/maintenance', label: 'Maintenance' },
      { to: '/landlord/expenses', label: 'Expenses' },
      { to: '/landlord/reports', label: 'Reports' },
    ]
  }
  return [
    { to: '/tenant/dashboard', label: 'Dashboard' },
    { to: '/tenant/payments', label: 'My Payments' },
    { to: '/tenant/maintenance', label: 'My Tickets' },
  ]
})

function go(to) {
  router.push(to)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <AppNavbar />
    <div class="mx-auto flex max-w-6xl">
      <aside
        class="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:block"
        aria-label="Section navigation"
      >
        <nav class="p-3">
          <ul class="space-y-1">
            <li v-for="item in links" :key="item.to">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm"
                :class="
                  route.path === item.to
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                "
                @click="go(item.to)"
              >
                <span>{{ item.label }}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main id="main-content" class="flex-1 px-4 py-5 focus:outline-none" tabindex="-1">
        <slot />
      </main>
    </div>
  </div>
</template>


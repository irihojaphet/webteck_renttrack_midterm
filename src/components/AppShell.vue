<script setup>
import SidebarNav from './SidebarNav.vue'
import Topbar from './Topbar.vue'

defineProps({
  navItems: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <div class="flex min-h-screen">
      <SidebarNav :items="navItems" />
      <div class="flex min-w-0 flex-1 flex-col">
        <Topbar :title="title" :subtitle="subtitle" />
        <div class="border-b border-slate-200 bg-white px-4 py-3 xl:hidden">
          <nav class="flex gap-2 overflow-x-auto" aria-label="Mobile section navigation">
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="whitespace-nowrap rounded-full border px-3 py-2 text-sm"
              :class="
                $route.path === item.to
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600'
              "
            >
              {{ item.label }}
            </RouterLink>
          </nav>
        </div>
        <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

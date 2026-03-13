<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <aside
    class="hidden w-72 shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur xl:block"
    aria-label="Section navigation"
  >
    <div class="sticky top-0 flex h-screen flex-col">
      <div class="border-b border-slate-200 px-6 py-6">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          RentTrack
        </p>
        <h1 class="mt-3 text-2xl font-semibold text-slate-900">
          Local property operations
        </h1>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Manage subscriptions, occupancy, rent proof reviews, and maintenance activity.
        </p>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="group flex items-start gap-3 rounded-2xl px-4 py-3 text-sm transition"
          :class="
            $route.path === item.to
              ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-100'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          "
        >
          <span
            class="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold"
            :class="$route.path === item.to ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'"
          >
            {{ item.shortLabel }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-medium">{{ item.label }}</span>
            <span class="mt-1 block text-xs leading-5 text-slate-500">
              {{ item.description }}
            </span>
          </span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

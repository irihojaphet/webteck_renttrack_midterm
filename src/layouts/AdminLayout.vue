<script setup>
import AppShell from '../components/AppShell.vue'

const navItems = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    shortLabel: 'AD',
  },
  {
    to: '/admin/landlords',
    label: 'Landlords',
    shortLabel: 'LL',
  },
  {
    to: '/admin/reports',
    label: 'Reports',
    shortLabel: 'RP',
  },
  {
    to: '/admin/audit',
    label: 'Audit',
    shortLabel: 'AU',
  },
]
</script>

<template>
  <AppShell
    :nav-items="navItems"
    title="Admin"
  >
    <RouterView />
  </AppShell>
</template>

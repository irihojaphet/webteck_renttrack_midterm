<script setup>
import AppShell from '../components/AppShell.vue'

const navItems = [
  {
    to: '/tenant/dashboard',
    label: 'Dashboard',
    shortLabel: 'DB',
  },
  {
    to: '/tenant/payments',
    label: 'Payments',
    shortLabel: 'PY',
  },
  {
    to: '/tenant/maintenance',
    label: 'Maintenance',
    shortLabel: 'MT',
  },
  {
    to: '/tenant/chat',
    label: 'Chat',
    shortLabel: 'CH',
  },
]
</script>

<template>
  <AppShell
    :nav-items="navItems"
    title="Tenant"
  >
    <RouterView />
  </AppShell>
</template>

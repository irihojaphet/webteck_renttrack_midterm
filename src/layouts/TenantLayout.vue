<script setup>
import AppShell from '../components/AppShell.vue'

const navItems = [
  {
    to: '/tenant/dashboard',
    label: 'Dashboard',
    shortLabel: 'DB',
    description: 'View your lease, rent status, and current support activity.',
  },
  {
    to: '/tenant/payments',
    label: 'Payments',
    shortLabel: 'PY',
    description: 'Submit monthly proof and review confirmation outcomes.',
  },
  {
    to: '/tenant/maintenance',
    label: 'Maintenance',
    shortLabel: 'MT',
    description: 'Open claims, upload images, and follow repair progress.',
  },
  {
    to: '/tenant/chat',
    label: 'Chat',
    shortLabel: 'CH',
    description: 'Discuss payment proofs, tickets, or general issues.',
  },
]
</script>

<template>
  <AppShell
    :nav-items="navItems"
    title="Tenant workspace"
    subtitle="Submit rent proof, report issues, and keep track of responses from your landlord."
  >
    <RouterView />
  </AppShell>
</template>

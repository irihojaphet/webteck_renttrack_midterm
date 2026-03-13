<script setup>
import AppShell from '../components/AppShell.vue'

const navItems = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    shortLabel: 'AD',
    description: 'Portfolio health, landlord coverage, and platform activity.',
  },
  {
    to: '/admin/landlords',
    label: 'Landlords',
    shortLabel: 'LL',
    description: 'Manage landlord accounts, plans, and payment state.',
  },
  {
    to: '/admin/reports',
    label: 'Reports',
    shortLabel: 'RP',
    description: 'Revenue snapshots and unpaid subscription lists.',
  },
  {
    to: '/admin/audit',
    label: 'Audit',
    shortLabel: 'AU',
    description: 'Track sensitive changes and operational actions.',
  },
]
</script>

<template>
  <AppShell
    :nav-items="navItems"
    title="Admin control center"
    subtitle="Oversee landlord subscriptions, revenue, audit history, and platform-wide activity."
  >
    <RouterView />
  </AppShell>
</template>

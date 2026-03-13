<script setup>
import AppShell from '../components/AppShell.vue'

const navItems = [
  {
    to: '/landlord/dashboard',
    label: 'Dashboard',
    shortLabel: 'DB',
  },
  {
    to: '/landlord/properties',
    label: 'Properties',
    shortLabel: 'PR',
  },
  {
    to: '/landlord/tenants',
    label: 'Tenants',
    shortLabel: 'TN',
  },
  {
    to: '/landlord/leases',
    label: 'Leases',
    shortLabel: 'LS',
  },
  {
    to: '/landlord/payments',
    label: 'Payments',
    shortLabel: 'PY',
  },
  {
    to: '/landlord/payment-proofs',
    label: 'Proofs',
    shortLabel: 'PF',
  },
  {
    to: '/landlord/maintenance',
    label: 'Maintenance',
    shortLabel: 'MT',
  },
  {
    to: '/landlord/chat',
    label: 'Chat',
    shortLabel: 'CH',
  },
]
</script>

<template>
  <AppShell
    :nav-items="navItems"
    title="Landlord"
  >
    <RouterView />
  </AppShell>
</template>

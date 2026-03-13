<script setup>
import AppShell from '../components/AppShell.vue'

const navItems = [
  {
    to: '/landlord/dashboard',
    label: 'Dashboard',
    shortLabel: 'DB',
    description: 'Track occupancy, pending proofs, and ticket backlog.',
  },
  {
    to: '/landlord/properties',
    label: 'Properties',
    shortLabel: 'PR',
    description: 'Manage buildings, categories, and generated units.',
  },
  {
    to: '/landlord/tenants',
    label: 'Tenants',
    shortLabel: 'TN',
    description: 'Assign tenants to units and maintain occupancy records.',
  },
  {
    to: '/landlord/leases',
    label: 'Leases',
    shortLabel: 'LS',
    description: 'Review active and ended leases with rent terms.',
  },
  {
    to: '/landlord/payments',
    label: 'Payments',
    shortLabel: 'PY',
    description: 'Monitor confirmed, partial, and late rent performance.',
  },
  {
    to: '/landlord/payment-proofs',
    label: 'Proofs',
    shortLabel: 'PF',
    description: 'Review tenant proof submissions before confirming rent.',
  },
  {
    to: '/landlord/maintenance',
    label: 'Maintenance',
    shortLabel: 'MT',
    description: 'Prioritize tickets and coordinate maintenance follow-up.',
  },
  {
    to: '/landlord/chat',
    label: 'Chat',
    shortLabel: 'CH',
    description: 'Tenant conversations linked to proofs and tickets.',
  },
]
</script>

<template>
  <AppShell
    :nav-items="navItems"
    title="Landlord operations"
    subtitle="Run properties, leases, payments, and resident support from one workspace."
  >
    <RouterView />
  </AppShell>
</template>

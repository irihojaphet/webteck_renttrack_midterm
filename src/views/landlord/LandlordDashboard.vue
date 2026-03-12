<script setup>
import { computed } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { usePropertiesStore } from '../../stores/properties'
import { useTenantsStore } from '../../stores/tenants'
import { useLeasesStore } from '../../stores/leases'
import { useTicketsStore } from '../../stores/tickets'
import { usePaymentsStore } from '../../stores/payments'

const propertiesStore = usePropertiesStore()
const tenantsStore = useTenantsStore()
const leasesStore = useLeasesStore()
const ticketsStore = useTicketsStore()
const paymentsStore = usePaymentsStore()

const monthlyTotals = computed(() => paymentsStore.totalsByMonth)
const latestMonth = computed(() => {
  const keys = Object.keys(monthlyTotals.value)
  if (!keys.length) return null
  return keys.sort().at(-1)
})
</script>

<template>
  <section aria-labelledby="landlord-dashboard-title">
    <PageHeader
      id="landlord-dashboard-title"
      title="Landlord dashboard"
      subtitle="Overview of your properties, tenants, leases, rent, and maintenance."
    />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard :label="'Properties'" :value="propertiesStore.count" />
      <StatCard :label="'Tenants'" :value="tenantsStore.count" />
      <StatCard :label="'Active leases'" :value="leasesStore.activeCount" />
      <StatCard
        :label="'Open tickets'"
        :value="ticketsStore.openCount"
      />
    </div>

    <section class="rounded-lg border border-slate-200 bg-white p-4">
      <h2 class="text-sm font-semibold text-slate-900">Recent rent collection</h2>
      <p v-if="!latestMonth" class="mt-2 text-sm text-slate-600">
        No payments recorded yet. Start by recording rent on the Payments page.
      </p>
      <div v-else class="mt-2 text-sm text-slate-700">
        <p>
          Latest month:
          <span class="font-semibold">{{ latestMonth }}</span>
        </p>
        <p class="mt-1">
          Total collected:
          <span class="font-semibold">
            {{ monthlyTotals[latestMonth].toLocaleString() }} RWF
          </span>
        </p>
      </div>
    </section>
  </section>
</template>


<script setup>
import { computed } from 'vue'
import Badge from '../../components/Badge.vue'
import StatCard from '../../components/StatCard.vue'
import Table from '../../components/Table.vue'
import { useLandlordsStore } from '../../stores/landlords'
import { useSubscriptionsStore } from '../../stores/subscriptions'

const landlordsStore = useLandlordsStore()
const subscriptionsStore = useSubscriptionsStore()

const unpaidRows = computed(() =>
  landlordsStore.items
    .map((landlord) => ({
      ...landlord,
      subscription: subscriptionsStore.getSubscription(landlord.id),
    }))
    .filter((row) => row.subscription?.status !== 'paid'),
)

const columns = [
  { key: 'fullName', label: 'Landlord' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'lastPaymentDate', label: 'Last payment' },
]
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        Revenue and risk
      </p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-950">
        Subscription revenue reports
      </h1>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        Annual plans contribute recurring revenue while lifetime plans create one-time spikes. Unpaid or expired
        landlords are shown below so the admin can follow up.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <StatCard label="Annual revenue" :value="`${subscriptionsStore.revenueSummary.annual.toLocaleString()} RWF`" tone="indigo" />
      <StatCard label="Lifetime revenue" :value="`${subscriptionsStore.revenueSummary.lifetime.toLocaleString()} RWF`" tone="emerald" />
      <StatCard label="Unpaid list" :value="unpaidRows.length" tone="amber" />
    </div>

    <Table :columns="columns" :rows="unpaidRows">
      <template #plan="{ row }">
        {{ row.subscription?.planType || 'annual' }}
      </template>
      <template #status="{ row }">
        <Badge :kind="row.subscription?.status || 'unpaid'" />
      </template>
      <template #lastPaymentDate="{ row }">
        {{ row.subscription?.lastPaymentDate || 'Not paid yet' }}
      </template>
    </Table>
  </section>
</template>

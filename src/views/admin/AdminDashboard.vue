<script setup>
import { computed } from 'vue'
import dashboardHero from '../../assets/placeholders/dashboard-hero.jpg'
import EmptyState from '../../components/EmptyState.vue'
import StatCard from '../../components/StatCard.vue'
import Table from '../../components/Table.vue'
import { useAuditLogsStore } from '../../stores/auditLogs'
import { useLandlordsStore } from '../../stores/landlords'
import { usePaymentsStore } from '../../stores/payments'
import { useSubscriptionsStore } from '../../stores/subscriptions'

const landlordsStore = useLandlordsStore()
const subscriptionsStore = useSubscriptionsStore()
const paymentsStore = usePaymentsStore()
const auditLogsStore = useAuditLogsStore()

const recentActivity = computed(() => auditLogsStore.sortedItems.slice(0, 8))
const columns = [
  { key: 'createdAt', label: 'When' },
  { key: 'actorRole', label: 'Actor' },
  { key: 'entityType', label: 'Entity' },
  { key: 'summary', label: 'Summary' },
]
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">
          Portfolio snapshot
        </p>
        <h1 class="mt-3 text-3xl font-semibold text-slate-950">
          Monitor landlord coverage and payment performance.
        </h1>
      </div>
      <img :src="dashboardHero" alt="" class="dashboard-hero-image h-full w-full rounded-[32px] border border-slate-200 object-cover shadow-sm" />
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Landlords" :value="landlordsStore.items.length" hint="Active landlord accounts." tone="indigo" />
      <StatCard label="Paid plans" :value="subscriptionsStore.paidCount" hint="Landlords with active access." tone="emerald" />
      <StatCard label="Unpaid or expired" :value="subscriptionsStore.unpaidCount" hint="Accounts currently gated." tone="amber" />
      <StatCard label="Revenue" :value="`${(subscriptionsStore.revenueSummary.annual + subscriptionsStore.revenueSummary.lifetime).toLocaleString()} RWF`" hint="Recognized subscription revenue." tone="slate" />
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
      <section class="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 class="text-xl font-semibold text-slate-950">
            Revenue mix
          </h2>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-[24px] bg-indigo-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-700">
              Annual plans
            </p>
            <p class="mt-3 text-3xl font-semibold text-indigo-950">
              {{ subscriptionsStore.revenueSummary.annual.toLocaleString() }} RWF
            </p>
          </div>
          <div class="rounded-[24px] bg-emerald-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Lifetime plans
            </p>
            <p class="mt-3 text-3xl font-semibold text-emerald-950">
              {{ subscriptionsStore.revenueSummary.lifetime.toLocaleString() }} RWF
            </p>
          </div>
        </div>
        <div class="rounded-[24px] bg-slate-50 p-5">
          <p class="text-sm text-slate-600">
            Tenant payment records currently total
            <span class="font-semibold text-slate-950">{{ paymentsStore.totalCollected.toLocaleString() }} RWF</span>
            across all confirmed rent transactions.
          </p>
        </div>
      </section>

      <section class="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-950">
          Recent activity
        </h2>
        <EmptyState
          v-if="!recentActivity.length"
          title="No audit events yet"
          description="Administrative actions will appear here after subscriptions, landlords, and approvals are updated."
        />
        <Table v-else :columns="columns" :rows="recentActivity">
          <template #createdAt="{ row }">
            {{ row.createdAt.slice(0, 16).replace('T', ' ') }}
          </template>
          <template #actorRole="{ row }">
            {{ row.actorRole }}
          </template>
        </Table>
      </section>
    </div>
  </section>
</template>

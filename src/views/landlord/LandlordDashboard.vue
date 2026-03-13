<script setup>
import { computed, ref } from 'vue'
import dashboardHero from '../../assets/placeholders/dashboard-hero.jpg'
import Badge from '../../components/Badge.vue'
import StatCard from '../../components/StatCard.vue'
import Table from '../../components/Table.vue'
import { useAuthStore } from '../../stores/auth'
import { useAuditLogsStore } from '../../stores/auditLogs'
import { useLeasesStore } from '../../stores/leases'
import { usePaymentProofsStore } from '../../stores/paymentProofs'
import { usePaymentsStore } from '../../stores/payments'
import { usePropertiesStore } from '../../stores/properties'
import { useTenantsStore } from '../../stores/tenants'
import { useTicketsStore } from '../../stores/tickets'
import { useUnitsStore } from '../../stores/units'

const auth = useAuthStore()
const propertiesStore = usePropertiesStore()
const unitsStore = useUnitsStore()
const tenantsStore = useTenantsStore()
const leasesStore = useLeasesStore()
const paymentProofsStore = usePaymentProofsStore()
const paymentsStore = usePaymentsStore()
const ticketsStore = useTicketsStore()
const auditLogsStore = useAuditLogsStore()

paymentsStore.syncLatePayments(leasesStore.activeItems)

const landlordId = computed(() => auth.currentUser.id)
const myProperties = computed(() => propertiesStore.items.filter((property) => property.landlordId === landlordId.value))
const myPropertyIds = computed(() => myProperties.value.map((property) => property.id))
const myUnits = computed(() => unitsStore.items.filter((unit) => myPropertyIds.value.includes(unit.propertyId)))
const myTenants = computed(() => tenantsStore.items.filter((tenant) => tenant.landlordId === landlordId.value))
const myTenantIds = computed(() => myTenants.value.map((tenant) => tenant.id))
const myProofs = computed(() => paymentProofsStore.items.filter((proof) => proof.landlordId === landlordId.value))
const myTickets = computed(() => ticketsStore.items.filter((ticket) => ticket.landlordId === landlordId.value))
const occupancyRate = computed(() => {
  if (!myUnits.value.length) return 0
  const occupied = myUnits.value.filter((unit) => unit.status === 'Occupied').length
  return Math.round((occupied / myUnits.value.length) * 100)
})
const unpaidTenants = computed(() => {
  const lateOrPartial = paymentsStore.items.filter(
    (payment) => myTenantIds.value.includes(payment.tenantId) && ['Late', 'Partial'].includes(payment.status),
  )
  return lateOrPartial.length
})
const roleFilter = ref('all')
const recentAudit = computed(() =>
  auditLogsStore.sortedItems
    .filter((item) => item.actorId === landlordId.value || myTenantIds.value.includes(item.actorId))
    .slice(0, 8),
)
const filteredAudit = computed(() =>
  recentAudit.value.filter((entry) => roleFilter.value === 'all' || entry.actorRole === roleFilter.value),
)
const auditColumns = [
  { key: 'createdAt', label: 'When' },
  { key: 'actionType', label: 'Action' },
  { key: 'entityType', label: 'Entity' },
  { key: 'summary', label: 'Summary' },
]
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">
          Landlord overview
        </p>
        <h1 class="mt-3 text-3xl font-semibold text-slate-950">
          Property occupancy, pending reviews, and maintenance load in one place.
        </h1>
      </div>
      <img :src="dashboardHero" alt="" class="dashboard-hero-image h-full w-full rounded-[32px] border border-slate-200 object-cover shadow-sm" />
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Properties" :value="myProperties.length" tone="indigo" />
      <StatCard label="Units" :value="myUnits.length" tone="slate" />
      <StatCard label="Occupancy" :value="`${occupancyRate}%`" tone="emerald" />
      <StatCard label="Pending proofs" :value="myProofs.filter((proof) => proof.status === 'Pending').length" tone="amber" />
      <StatCard label="Open tickets" :value="myTickets.filter((ticket) => ticket.status !== 'Resolved').length" tone="amber" />
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
      <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-950">
          Portfolio health
        </h2>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <div class="rounded-[24px] bg-slate-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Occupied units
            </p>
            <p class="mt-3 text-3xl font-semibold text-slate-950">
              {{ myUnits.filter((unit) => unit.status === 'Occupied').length }}
            </p>
          </div>
          <div class="rounded-[24px] bg-amber-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              Late or partial tenant records
            </p>
            <p class="mt-3 text-3xl font-semibold text-amber-950">
              {{ unpaidTenants }}
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-xl font-semibold text-slate-950">
            Landlord audit trail
          </h2>
          <select v-model="roleFilter" class="rounded-2xl border border-slate-300 px-4 py-2 text-sm">
            <option value="all">All actor roles</option>
            <option value="landlord">Landlord actions</option>
            <option value="tenant">Tenant actions</option>
          </select>
        </div>
        <div class="mt-4">
          <Table :columns="auditColumns" :rows="filteredAudit">
            <template #createdAt="{ row }">
              {{ row.createdAt.slice(0, 16).replace('T', ' ') }}
            </template>
            <template #actionType="{ row }">
              <Badge :kind="row.actionType" />
            </template>
          </Table>
        </div>
      </section>
    </div>
  </section>
</template>

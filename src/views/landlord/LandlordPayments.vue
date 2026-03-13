<script setup>
import { computed } from 'vue'
import Badge from '../../components/Badge.vue'
import Table from '../../components/Table.vue'
import { useAuthStore } from '../../stores/auth'
import { useLeasesStore } from '../../stores/leases'
import { usePaymentsStore } from '../../stores/payments'
import { useTenantsStore } from '../../stores/tenants'

const auth = useAuthStore()
const paymentsStore = usePaymentsStore()
const leasesStore = useLeasesStore()
const tenantsStore = useTenantsStore()

paymentsStore.syncLatePayments(leasesStore.activeItems.filter((lease) => lease.landlordId === auth.currentUser.id))

const rows = computed(() =>
  paymentsStore.items
    .filter((payment) =>
      leasesStore.items.some((lease) => lease.id === payment.leaseId && lease.landlordId === auth.currentUser.id),
    )
    .map((payment) => ({
      ...payment,
      lease: leasesStore.items.find((lease) => lease.id === payment.leaseId),
      tenant: tenantsStore.items.find((tenant) => tenant.id === payment.tenantId),
    }))
    .sort((a, b) => b.month.localeCompare(a.month)),
)

const columns = [
  { key: 'month', label: 'Month' },
  { key: 'tenant', label: 'Tenant' },
  { key: 'amountPaid', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function markLate(row) {
  paymentsStore.markLate(row.lease, row.month, { role: auth.role, id: auth.currentUser.id })
}
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-3xl font-semibold text-slate-950">
        Confirmed payments and late ledger
      </h1>
    </div>

    <Table :columns="columns" :rows="rows">
      <template #tenant="{ row }">
        {{ row.tenant?.fullName }}
      </template>
      <template #amountPaid="{ row }">
        {{ Number(row.amountPaid).toLocaleString() }} RWF
      </template>
      <template #status="{ row }">
        <Badge :kind="row.status" />
      </template>
      <template #actions="{ row }">
        <button
          v-if="row.status !== 'Late'"
          type="button"
          class="rounded-full border border-slate-200 px-3 py-1 text-xs"
          @click="markLate(row)"
        >
          Mark late
        </button>
      </template>
    </Table>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import Badge from '../../components/Badge.vue'
import Table from '../../components/Table.vue'
import { useAuthStore } from '../../stores/auth'
import { useLeasesStore } from '../../stores/leases'
import { usePropertiesStore } from '../../stores/properties'
import { useTenantsStore } from '../../stores/tenants'
import { useUnitsStore } from '../../stores/units'

const auth = useAuthStore()
const leasesStore = useLeasesStore()
const tenantsStore = useTenantsStore()
const propertiesStore = usePropertiesStore()
const unitsStore = useUnitsStore()

const rows = computed(() =>
  leasesStore.items
    .filter((lease) => lease.landlordId === auth.currentUser.id)
    .map((lease) => ({
      ...lease,
      tenant: tenantsStore.items.find((tenant) => tenant.id === lease.tenantId),
      property: propertiesStore.items.find((property) => property.id === lease.propertyId),
      unit: unitsStore.items.find((unit) => unit.id === lease.unitId),
    })),
)

const columns = [
  { key: 'tenant', label: 'Tenant' },
  { key: 'property', label: 'Property' },
  { key: 'rent', label: 'Monthly rent' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function endLease(id) {
  leasesStore.endLease(id, { role: auth.role, id: auth.currentUser.id })
}
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-3xl font-semibold text-slate-950">
        Leases
      </h1>
    </div>

    <Table :columns="columns" :rows="rows">
      <template #tenant="{ row }">
        <div>
          <p class="font-medium text-slate-950">{{ row.tenant?.fullName }}</p>
          <p class="text-xs text-slate-500">{{ row.startDate }}</p>
        </div>
      </template>
      <template #property="{ row }">
        <div>
          <p class="font-medium text-slate-950">{{ row.property?.name }}</p>
          <p class="text-xs text-slate-500">{{ row.unit?.code }}</p>
        </div>
      </template>
      <template #rent="{ row }">
        {{ Number(row.monthlyRent).toLocaleString() }} RWF
      </template>
      <template #status="{ row }">
        <Badge :kind="row.status" />
      </template>
      <template #actions="{ row }">
        <button
          v-if="row.status === 'active'"
          type="button"
          class="rounded-full border border-slate-200 px-3 py-1 text-xs"
          @click="endLease(row.id)"
        >
          End lease
        </button>
      </template>
    </Table>
  </section>
</template>

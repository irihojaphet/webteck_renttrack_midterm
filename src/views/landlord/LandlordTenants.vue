<script setup>
import { computed, reactive, ref, watch } from 'vue'
import EmptyState from '../../components/EmptyState.vue'
import FormField from '../../components/FormField.vue'
import Modal from '../../components/Modal.vue'
import Table from '../../components/Table.vue'
import emptyTenants from '../../assets/placeholders/empty-tenants.svg'
import { useAuthStore } from '../../stores/auth'
import { useLeasesStore } from '../../stores/leases'
import { usePropertiesStore } from '../../stores/properties'
import { useTenantsStore } from '../../stores/tenants'
import { useUnitsStore } from '../../stores/units'

const auth = useAuthStore()
const propertiesStore = usePropertiesStore()
const unitsStore = useUnitsStore()
const tenantsStore = useTenantsStore()
const leasesStore = useLeasesStore()

const modalOpen = ref(false)
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  propertyId: '',
  unitId: '',
  monthlyRent: 0,
  startDate: new Date().toISOString().slice(0, 10),
})

const landlordId = computed(() => auth.currentUser.id)
const myProperties = computed(() => propertiesStore.items.filter((property) => property.landlordId === landlordId.value))
const availableUnits = computed(() => unitsStore.items.filter((unit) => unit.propertyId === form.propertyId && unit.status === 'Available'))
const myTenants = computed(() =>
  tenantsStore.items
    .filter((tenant) => tenant.landlordId === landlordId.value)
    .map((tenant) => ({
      ...tenant,
      property: propertiesStore.items.find((property) => property.id === tenant.propertyId),
      unit: unitsStore.items.find((unit) => unit.id === tenant.unitId),
      lease: leasesStore.items.find((lease) => lease.tenantId === tenant.id && lease.status === 'active'),
    })),
)

watch(
  () => form.propertyId,
  () => {
    form.unitId = ''
  },
)

const columns = [
  { key: 'fullName', label: 'Tenant' },
  { key: 'contact', label: 'Contact' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'rent', label: 'Monthly rent' },
]

function resetForm() {
  form.fullName = ''
  form.email = ''
  form.password = ''
  form.phone = ''
  form.propertyId = ''
  form.unitId = ''
  form.monthlyRent = 0
  form.startDate = new Date().toISOString().slice(0, 10)
}

function createTenant() {
  tenantsStore.createTenantWithLease(
    {
      landlordId: landlordId.value,
      ...form,
    },
    { role: auth.role, id: auth.currentUser.id },
  )
  modalOpen.value = false
  resetForm()
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 class="text-3xl font-semibold text-slate-950">
          Tenants and unit assignment
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          New tenants must be assigned to a property and one available unit. Creating the tenant also creates an active
          lease and marks the unit occupied.
        </p>
      </div>
      <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white" @click="modalOpen = true">
        Add tenant
      </button>
    </div>

    <EmptyState
      v-if="!myTenants.length"
      :image-src="emptyTenants"
      title="No tenants assigned yet"
      description="Add a tenant with an available unit to create the first active lease."
      action-label="Add tenant"
      @action="modalOpen = true"
    />

    <Table v-else :columns="columns" :rows="myTenants">
      <template #contact="{ row }">
        <div>
          <p>{{ row.email }}</p>
          <p class="text-xs text-slate-500">{{ row.phone }}</p>
        </div>
      </template>
      <template #assignment="{ row }">
        <div>
          <p class="font-medium text-slate-950">{{ row.property?.name }}</p>
          <p class="text-xs text-slate-500">{{ row.unit?.code }}</p>
        </div>
      </template>
      <template #rent="{ row }">
        {{ Number(row.lease?.monthlyRent || 0).toLocaleString() }} RWF
      </template>
    </Table>

    <Modal v-model="modalOpen" title="Add tenant and create lease">
      <div class="grid gap-4 md:grid-cols-2">
        <FormField field-id="tenant-name" label="Full name">
          <input id="tenant-name" v-model="form.fullName" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="tenant-email" label="Email">
          <input id="tenant-email" v-model="form.email" type="email" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="tenant-password" label="Password">
          <input id="tenant-password" v-model="form.password" type="password" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="tenant-phone" label="Phone">
          <input id="tenant-phone" v-model="form.phone" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="tenant-property" label="Property">
          <select id="tenant-property" v-model="form.propertyId" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
            <option value="">Select property</option>
            <option v-for="property in myProperties" :key="property.id" :value="property.id">
              {{ property.name }}
            </option>
          </select>
        </FormField>
        <FormField field-id="tenant-unit" label="Available unit">
          <select id="tenant-unit" v-model="form.unitId" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
            <option value="">Select unit</option>
            <option v-for="unit in availableUnits" :key="unit.id" :value="unit.id">
              {{ unit.code }}
            </option>
          </select>
        </FormField>
        <FormField field-id="tenant-rent" label="Monthly rent">
          <input id="tenant-rent" v-model.number="form.monthlyRent" type="number" min="0" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="tenant-start" label="Lease start date">
          <input id="tenant-start" v-model="form.startDate" type="date" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
      </div>
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm" @click="modalOpen = false">
          Cancel
        </button>
        <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" @click="createTenant">
          Save tenant
        </button>
      </div>
    </Modal>
  </section>
</template>

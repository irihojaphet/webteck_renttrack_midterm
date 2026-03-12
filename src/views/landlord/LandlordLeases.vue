<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import BaseModal from '../../components/BaseModal.vue'
import BadgeStatus from '../../components/BadgeStatus.vue'
import { useLeasesStore } from '../../stores/leases'
import { useTenantsStore } from '../../stores/tenants'
import { usePropertiesStore } from '../../stores/properties'

const leasesStore = useLeasesStore()
const tenantsStore = useTenantsStore()
const propertiesStore = usePropertiesStore()

const isModalOpen = ref(false)
const selectedLease = ref(null)

const tenantId = ref('')
const propertyId = ref('')
const startDate = ref('')
const monthlyRent = ref('')
const status = ref('active')

const tenantError = ref('')
const propertyError = ref('')
const startDateError = ref('')
const monthlyRentError = ref('')

const search = ref('')

const leasesWithDetails = computed(() =>
  leasesStore.items.map((lease) => ({
    ...lease,
    tenant: tenantsStore.byId.get(lease.tenantId) || null,
    property: propertiesStore.byId.get(lease.propertyId) || null,
  })),
)

const filteredLeases = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return leasesWithDetails.value
  return leasesWithDetails.value.filter((lease) => {
    const pieces = [
      lease.tenant?.fullName,
      lease.tenant?.email,
      lease.property?.name,
      lease.property?.location,
      lease.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return pieces.includes(term)
  })
})

function openCreate() {
  selectedLease.value = null
  tenantId.value = tenantsStore.items[0]?.id || ''
  propertyId.value = propertiesStore.items[0]?.id || ''
  startDate.value = new Date().toISOString().slice(0, 10)
  monthlyRent.value = ''
  status.value = 'active'
  tenantError.value = ''
  propertyError.value = ''
  startDateError.value = ''
  monthlyRentError.value = ''
  isModalOpen.value = true
}

function openEdit(lease) {
  selectedLease.value = lease
  tenantId.value = lease.tenantId
  propertyId.value = lease.propertyId
  startDate.value = lease.startDate
  monthlyRent.value = lease.monthlyRent
  status.value = lease.status
  tenantError.value = ''
  propertyError.value = ''
  startDateError.value = ''
  monthlyRentError.value = ''
  isModalOpen.value = true
}

function validate() {
  tenantError.value = ''
  propertyError.value = ''
  startDateError.value = ''
  monthlyRentError.value = ''

  let ok = true
  if (!tenantId.value) {
    tenantError.value = 'Please choose a tenant.'
    ok = false
  }
  if (!propertyId.value) {
    propertyError.value = 'Please choose a property.'
    ok = false
  }
  if (!startDate.value) {
    startDateError.value = 'Please provide a lease start date.'
    ok = false
  }
  if (!monthlyRent.value || Number(monthlyRent.value) <= 0) {
    monthlyRentError.value = 'Monthly rent must be a positive number.'
    ok = false
  }
  return ok
}

function save() {
  if (!validate()) return
  const payload = {
    tenantId: tenantId.value,
    propertyId: propertyId.value,
    startDate: startDate.value,
    monthlyRent: Number(monthlyRent.value),
    status: status.value,
  }
  if (selectedLease.value) {
    leasesStore.edit(selectedLease.value.id, payload)
  } else {
    leasesStore.add(payload)
  }
  isModalOpen.value = false
}

function endLease(lease) {
  if (lease.status === 'ended') return
  if (window.confirm('Mark this lease as ended?')) {
    leasesStore.edit(lease.id, { status: 'ended' })
  }
}

function deleteLease(lease) {
  if (window.confirm('Delete this lease? Existing payments will not be removed.')) {
    leasesStore.removeById(lease.id)
  }
}
</script>

<template>
  <section aria-labelledby="landlord-leases-title">
    <PageHeader
      id="landlord-leases-title"
      title="Leases"
      subtitle="Connect tenants to properties and define the monthly rent you expect."
    />

    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label class="flex-1 text-sm">
        <span class="sr-only">Search leases</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search by tenant, property, or status"
          class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        @click="openCreate"
      >
        Create lease
      </button>
    </div>

    <div v-if="!leasesStore.items.length" class="mt-4">
      <EmptyState
        title="No leases yet"
        description="Create a lease to start tracking rent for a tenant in a specific property."
        action-label="Create lease"
        @action="openCreate"
      />
    </div>

    <div v-else>
      <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th scope="col" class="px-3 py-2">Tenant</th>
              <th scope="col" class="px-3 py-2">Property</th>
              <th scope="col" class="px-3 py-2">Start date</th>
              <th scope="col" class="px-3 py-2">Monthly rent</th>
              <th scope="col" class="px-3 py-2">Status</th>
              <th scope="col" class="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="lease in filteredLeases"
              :key="lease.id"
              class="border-t border-slate-100 hover:bg-slate-50"
            >
              <td class="px-3 py-2 text-slate-900">
                <p>{{ lease.tenant?.fullName || 'Unknown tenant' }}</p>
                <p v-if="lease.tenant?.email" class="text-xs text-slate-500">
                  {{ lease.tenant.email }}
                </p>
              </td>
              <td class="px-3 py-2 text-slate-700">
                <p>{{ lease.property?.name || 'Unknown property' }}</p>
                <p v-if="lease.property?.location" class="text-xs text-slate-500">
                  {{ lease.property.location }}
                </p>
              </td>
              <td class="px-3 py-2 text-xs text-slate-700">
                {{ lease.startDate }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                {{ Number(lease.monthlyRent).toLocaleString() }} RWF
              </td>
              <td class="px-3 py-2">
                <BadgeStatus :kind="lease.status === 'active' ? 'Open' : 'Resolved'" />
              </td>
              <td class="px-3 py-2 text-right">
                <div class="inline-flex gap-2">
                  <button
                    type="button"
                    class="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    @click="openEdit(lease)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-amber-200 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                    :disabled="lease.status === 'ended'"
                    @click="endLease(lease)"
                  >
                    End lease
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    @click="deleteLease(lease)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal v-model="isModalOpen" :title="selectedLease ? 'Edit lease' : 'Create lease'">
      <form
        class="space-y-3"
        @submit.prevent="save"
      >
        <div>
          <label for="lease-tenant" class="block text-sm font-medium text-slate-800">Tenant</label>
          <select
            id="lease-tenant"
            v-model="tenantId"
            class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="tenantError ? 'true' : 'false'"
            aria-describedby="lease-tenant-error"
          >
            <option value="" disabled>Select a tenant</option>
            <option
              v-for="tenant in tenantsStore.items"
              :key="tenant.id"
              :value="tenant.id"
            >
              {{ tenant.fullName }} — {{ tenant.email }}
            </option>
          </select>
          <p
            v-if="tenantError"
            id="lease-tenant-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ tenantError }}
          </p>
        </div>

        <div>
          <label for="lease-property" class="block text-sm font-medium text-slate-800">Property</label>
          <select
            id="lease-property"
            v-model="propertyId"
            class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="propertyError ? 'true' : 'false'"
            aria-describedby="lease-property-error"
          >
            <option value="" disabled>Select a property</option>
            <option
              v-for="property in propertiesStore.items"
              :key="property.id"
              :value="property.id"
            >
              {{ property.name }} — {{ property.location }}
            </option>
          </select>
          <p
            v-if="propertyError"
            id="lease-property-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ propertyError }}
          </p>
        </div>

        <div>
          <label for="lease-start" class="block text-sm font-medium text-slate-800">Start date</label>
          <input
            id="lease-start"
            v-model="startDate"
            type="date"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="startDateError ? 'true' : 'false'"
            aria-describedby="lease-start-error"
          />
          <p
            v-if="startDateError"
            id="lease-start-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ startDateError }}
          </p>
        </div>

        <div>
          <label for="lease-rent" class="block text-sm font-medium text-slate-800">Monthly rent (RWF)</label>
          <input
            id="lease-rent"
            v-model="monthlyRent"
            type="number"
            min="0"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="monthlyRentError ? 'true' : 'false'"
            aria-describedby="lease-rent-error"
          />
          <p
            v-if="monthlyRentError"
            id="lease-rent-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ monthlyRentError }}
          </p>
        </div>

        <div>
          <label for="lease-status" class="block text-sm font-medium text-slate-800">Status</label>
          <select
            id="lease-status"
            v-model="status"
            class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          @click="isModalOpen = false"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          @click="save"
        >
          Save
        </button>
      </template>
    </BaseModal>
  </section>
</template>


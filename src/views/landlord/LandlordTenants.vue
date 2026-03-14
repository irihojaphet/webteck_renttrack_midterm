<script setup>
import { computed, reactive, ref, watch } from 'vue'
import EmptyState from '../../components/EmptyState.vue'
import FormField from '../../components/FormField.vue'
import Modal from '../../components/Modal.vue'
import PasswordField from '../../components/PasswordField.vue'
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
const editId = ref('')
const actionError = ref('')
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
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
  { key: 'actions', label: 'Actions' },
]

function resetForm() {
  form.fullName = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.phone = ''
  form.propertyId = ''
  form.unitId = ''
  form.monthlyRent = 0
  form.startDate = new Date().toISOString().slice(0, 10)
  editId.value = ''
  actionError.value = ''
}

function openCreate() {
  resetForm()
  modalOpen.value = true
}

function openEdit(row) {
  resetForm()
  editId.value = row.id
  form.fullName = row.fullName
  form.email = row.email
  form.phone = row.phone
  form.propertyId = row.propertyId
  form.unitId = row.unitId
  form.monthlyRent = Number(row.lease?.monthlyRent || 0)
  form.startDate = row.lease?.startDate || new Date().toISOString().slice(0, 10)
  modalOpen.value = true
}

function saveTenant() {
  actionError.value = ''
  try {
    if (!editId.value) {
      if (form.password.length < 6) {
        throw new Error('Use at least 6 characters for the tenant password.')
      }
      if (!form.confirmPassword) {
        throw new Error('Confirm the tenant password before saving.')
      }
      if (form.password !== form.confirmPassword) {
        throw new Error('Tenant passwords do not match.')
      }
    }

    if (editId.value) {
      tenantsStore.updateTenant(
        editId.value,
        {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        { role: auth.role, id: auth.currentUser.id },
      )
    } else {
      tenantsStore.createTenantWithLease(
        {
          landlordId: landlordId.value,
          ...form,
        },
        { role: auth.role, id: auth.currentUser.id },
      )
    }
    modalOpen.value = false
    resetForm()
  } catch (error) {
    actionError.value = error.message || 'Unable to save tenant.'
  }
}

function removeTenant(row) {
  actionError.value = ''
  try {
    tenantsStore.removeTenant(row.id, { role: auth.role, id: auth.currentUser.id })
  } catch (error) {
    actionError.value = error.message || 'Unable to remove tenant.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 class="text-3xl font-semibold text-slate-950">
          Tenants and unit assignment
        </h1>
      </div>
      <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white" @click="openCreate">
        Add tenant
      </button>
    </div>

    <div v-if="actionError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
      {{ actionError }}
    </div>

    <EmptyState
      v-if="!myTenants.length"
      :image-src="emptyTenants"
      title="No tenants assigned yet"
      description="Add a tenant with an available unit to create the first active lease."
      action-label="Add tenant"
      @action="openCreate"
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
      <template #actions="{ row }">
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="openEdit(row)">
            Edit
          </button>
          <button type="button" class="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-700" @click="removeTenant(row)">
            Delete
          </button>
        </div>
      </template>
    </Table>

    <Modal v-model="modalOpen" :title="editId ? 'Edit tenant profile' : 'Add tenant and create lease'">
      <div v-if="actionError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
        {{ actionError }}
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <FormField field-id="tenant-name" label="Full name">
          <input id="tenant-name" v-model="form.fullName" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="tenant-email" label="Email">
          <input id="tenant-email" v-model="form.email" type="email" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <PasswordField
          v-if="!editId"
          v-model="form.password"
          field-id="tenant-password"
          label="Password"
          autocomplete="new-password"
          hint="Use at least 6 characters for the tenant login."
        />
        <PasswordField
          v-if="!editId"
          v-model="form.confirmPassword"
          field-id="tenant-confirm-password"
          label="Confirm password"
          autocomplete="new-password"
        />
        <FormField field-id="tenant-phone" label="Phone">
          <input id="tenant-phone" v-model="form.phone" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="tenant-property" label="Property" :hint="editId ? 'Assignment changes stay locked after lease creation.' : ''">
          <select id="tenant-property" v-model="form.propertyId" :disabled="Boolean(editId)" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:bg-slate-100">
            <option value="">Select property</option>
            <option v-for="property in myProperties" :key="property.id" :value="property.id">
              {{ property.name }}
            </option>
          </select>
        </FormField>
        <FormField field-id="tenant-unit" label="Available unit">
          <select id="tenant-unit" v-model="form.unitId" :disabled="Boolean(editId)" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:bg-slate-100">
            <option value="">Select unit</option>
            <option v-for="unit in availableUnits" :key="unit.id" :value="unit.id">
              {{ unit.code }}
            </option>
          </select>
        </FormField>
        <FormField field-id="tenant-rent" label="Monthly rent">
          <input id="tenant-rent" v-model.number="form.monthlyRent" :disabled="Boolean(editId)" type="number" min="0" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:bg-slate-100" />
        </FormField>
        <FormField field-id="tenant-start" label="Lease start date">
          <input id="tenant-start" v-model="form.startDate" :disabled="Boolean(editId)" type="date" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:bg-slate-100" />
        </FormField>
      </div>
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm" @click="modalOpen = false">
          Cancel
        </button>
        <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" @click="saveTenant">
          {{ editId ? 'Save tenant' : 'Create tenant' }}
        </button>
      </div>
    </Modal>
  </section>
</template>

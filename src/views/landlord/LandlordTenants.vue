<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import BaseModal from '../../components/BaseModal.vue'
import { useTenantsStore } from '../../stores/tenants'
import { usePropertiesStore } from '../../stores/properties'

const tenantsStore = useTenantsStore()
const propertiesStore = usePropertiesStore()

const search = ref('')
const selectedTenant = ref(null)
const isModalOpen = ref(false)

const fullName = ref('')
const phone = ref('')
const email = ref('')
const propertyId = ref('')
const unitLabel = ref('')

const fullNameError = ref('')
const emailError = ref('')
const propertyError = ref('')

const filteredTenants = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return tenantsStore.items
  return tenantsStore.items.filter((t) => {
    const property = propertiesStore.byId.get(t.propertyId)
    const haystack = [
      t.fullName,
      t.email,
      t.phone,
      t.unitLabel,
      property ? property.name : '',
      property ? property.location : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(term)
  })
})

function openCreate() {
  selectedTenant.value = null
  fullName.value = ''
  phone.value = ''
  email.value = ''
  propertyId.value = propertiesStore.items[0]?.id || ''
  unitLabel.value = ''
  fullNameError.value = ''
  emailError.value = ''
  propertyError.value = ''
  isModalOpen.value = true
}

function openEdit(tenant) {
  selectedTenant.value = tenant
  fullName.value = tenant.fullName
  phone.value = tenant.phone || ''
  email.value = tenant.email
  propertyId.value = tenant.propertyId || propertiesStore.items[0]?.id || ''
  unitLabel.value = tenant.unitLabel || ''
  fullNameError.value = ''
  emailError.value = ''
  propertyError.value = ''
  isModalOpen.value = true
}

function validate() {
  fullNameError.value = ''
  emailError.value = ''
  propertyError.value = ''

  let ok = true
  if (!fullName.value.trim()) {
    fullNameError.value = 'Please enter the tenant’s full name.'
    ok = false
  }
  if (!email.value.trim()) {
    emailError.value = 'Please enter the tenant’s email address.'
    ok = false
  }
  if (!propertyId.value) {
    propertyError.value = 'Please assign the tenant to a property.'
    ok = false
  }
  return ok
}

function save() {
  if (!validate()) return
  const payload = {
    fullName: fullName.value.trim(),
    phone: phone.value.trim() || undefined,
    email: email.value.trim(),
    propertyId: propertyId.value,
    unitLabel: unitLabel.value.trim() || undefined,
  }
  if (selectedTenant.value) {
    tenantsStore.edit(selectedTenant.value.id, payload)
  } else {
    tenantsStore.add(payload)
  }
  isModalOpen.value = false
}

function confirmRemove(tenant) {
  if (
    window.confirm(
      `Remove ${tenant.fullName}? Any existing leases will remain but you will no longer see this tenant in the list.`,
    )
  ) {
    tenantsStore.removeById(tenant.id)
  }
}
</script>

<template>
  <section aria-labelledby="landlord-tenants-title">
    <PageHeader
      id="landlord-tenants-title"
      title="Tenants"
      subtitle="Keep track of who lives in each unit and how to contact them."
    />

    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label class="flex-1 text-sm">
        <span class="sr-only">Search tenants</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search by name, email, phone, property, or unit"
          class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        @click="openCreate"
      >
        Add tenant
      </button>
    </div>

    <div v-if="!tenantsStore.items.length" class="mt-4">
      <EmptyState
        title="No tenants yet"
        description="Add your first tenant so you can create a lease and start tracking rent."
        action-label="Add tenant"
        @action="openCreate"
      />
    </div>

    <div v-else>
      <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th scope="col" class="px-3 py-2">Name</th>
              <th scope="col" class="px-3 py-2">Contact</th>
              <th scope="col" class="px-3 py-2">Property / Unit</th>
              <th scope="col" class="px-3 py-2">Created</th>
              <th scope="col" class="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tenant in filteredTenants"
              :key="tenant.id"
              class="border-t border-slate-100 hover:bg-slate-50"
            >
              <td class="px-3 py-2 text-slate-900">
                {{ tenant.fullName }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                <p>{{ tenant.email }}</p>
                <p v-if="tenant.phone" class="text-xs text-slate-500">
                  {{ tenant.phone }}
                </p>
              </td>
              <td class="px-3 py-2 text-slate-700">
                <p>
                  {{
                    propertiesStore.byId.get(tenant.propertyId)?.name || 'Not assigned'
                  }}
                </p>
                <p v-if="tenant.unitLabel" class="text-xs text-slate-500">
                  Unit {{ tenant.unitLabel }}
                </p>
              </td>
              <td class="px-3 py-2 text-xs text-slate-500">
                {{ tenant.createdAt?.slice(0, 10) }}
              </td>
              <td class="px-3 py-2 text-right">
                <div class="inline-flex gap-2">
                  <button
                    type="button"
                    class="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    @click="openEdit(tenant)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    @click="confirmRemove(tenant)"
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

    <BaseModal v-model="isModalOpen" :title="selectedTenant ? 'Edit tenant' : 'Add tenant'">
      <form
        class="space-y-3"
        @submit.prevent="save"
      >
        <div>
          <label for="tenant-name" class="block text-sm font-medium text-slate-800">Full name</label>
          <input
            id="tenant-name"
            v-model="fullName"
            type="text"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="fullNameError ? 'true' : 'false'"
            aria-describedby="tenant-name-error"
          />
          <p
            v-if="fullNameError"
            id="tenant-name-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ fullNameError }}
          </p>
        </div>

        <div>
          <label for="tenant-email" class="block text-sm font-medium text-slate-800">Email</label>
          <input
            id="tenant-email"
            v-model="email"
            type="email"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="emailError ? 'true' : 'false'"
            aria-describedby="tenant-email-error"
          />
          <p
            v-if="emailError"
            id="tenant-email-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ emailError }}
          </p>
        </div>

        <div>
          <label for="tenant-phone" class="block text-sm font-medium text-slate-800">Phone (optional)</label>
          <input
            id="tenant-phone"
            v-model="phone"
            type="tel"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="tenant-property" class="block text-sm font-medium text-slate-800">Property</label>
          <select
            id="tenant-property"
            v-model="propertyId"
            class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="propertyError ? 'true' : 'false'"
            aria-describedby="tenant-property-error"
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
            id="tenant-property-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ propertyError }}
          </p>
        </div>

        <div>
          <label for="tenant-unit" class="block text-sm font-medium text-slate-800">Unit label (optional)</label>
          <input
            id="tenant-unit"
            v-model="unitLabel"
            type="text"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. A-2 or 3B"
          />
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


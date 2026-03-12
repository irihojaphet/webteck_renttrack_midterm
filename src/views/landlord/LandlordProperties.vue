<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import BaseModal from '../../components/BaseModal.vue'
import { usePropertiesStore } from '../../stores/properties'

const store = usePropertiesStore()

const search = ref('')
const selectedProperty = ref(null)
const isModalOpen = ref(false)

const name = ref('')
const location = ref('')
const unitsCount = ref('')

const nameError = ref('')
const locationError = ref('')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return store.items
  return store.items.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term),
  )
})

function openCreate() {
  selectedProperty.value = null
  name.value = ''
  location.value = ''
  unitsCount.value = ''
  nameError.value = ''
  locationError.value = ''
  isModalOpen.value = true
}

function openEdit(property) {
  selectedProperty.value = property
  name.value = property.name
  location.value = property.location
  unitsCount.value = property.unitsCount || ''
  nameError.value = ''
  locationError.value = ''
  isModalOpen.value = true
}

function validate() {
  nameError.value = ''
  locationError.value = ''
  let ok = true
  if (!name.value.trim()) {
    nameError.value = 'Please provide a property name tenants will recognise.'
    ok = false
  }
  if (!location.value.trim()) {
    locationError.value = 'Please specify where the property is located.'
    ok = false
  }
  return ok
}

function save() {
  if (!validate()) return
  const payload = {
    name: name.value.trim(),
    location: location.value.trim(),
    unitsCount: unitsCount.value ? Number(unitsCount.value) : undefined,
  }
  if (selectedProperty.value) {
    store.edit(selectedProperty.value.id, payload)
  } else {
    store.add(payload)
  }
  isModalOpen.value = false
}

function confirmRemove(property) {
  if (window.confirm(`Delete ${property.name}? This cannot be undone.`)) {
    store.removeById(property.id)
  }
}
</script>

<template>
  <section aria-labelledby="landlord-properties-title">
    <PageHeader
      id="landlord-properties-title"
      title="Properties"
      subtitle="Manage the buildings and units you are responsible for."
    />

    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label class="flex-1 text-sm">
        <span class="sr-only">Search properties</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search by name or location"
          class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        @click="openCreate"
      >
        Add property
      </button>
    </div>

    <div v-if="!store.items.length" class="mt-4">
      <EmptyState
        title="No properties yet"
        description="Start by adding your first property so you can assign tenants and track rent."
        action-label="Add property"
        @action="openCreate"
      />
    </div>

    <div v-else>
      <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th scope="col" class="px-3 py-2">Name</th>
              <th scope="col" class="px-3 py-2">Location</th>
              <th scope="col" class="px-3 py-2">Units</th>
              <th scope="col" class="px-3 py-2">Created</th>
              <th scope="col" class="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="property in filtered"
              :key="property.id"
              class="border-t border-slate-100 hover:bg-slate-50"
            >
              <td class="px-3 py-2 text-slate-900">
                {{ property.name }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                {{ property.location }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                {{ property.unitsCount ?? '—' }}
              </td>
              <td class="px-3 py-2 text-xs text-slate-500">
                {{ property.createdAt?.slice(0, 10) }}
              </td>
              <td class="px-3 py-2 text-right">
                <div class="inline-flex gap-2">
                  <button
                    type="button"
                    class="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    @click="openEdit(property)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    @click="confirmRemove(property)"
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

    <BaseModal v-model="isModalOpen" :title="selectedProperty ? 'Edit property' : 'Add property'">
      <form
        class="space-y-3"
        @submit.prevent="save"
      >
        <div>
          <label for="property-name" class="block text-sm font-medium text-slate-800">Name</label>
          <input
            id="property-name"
            v-model="name"
            type="text"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="nameError ? 'true' : 'false'"
            aria-describedby="property-name-error"
          />
          <p
            v-if="nameError"
            id="property-name-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ nameError }}
          </p>
        </div>

        <div>
          <label for="property-location" class="block text-sm font-medium text-slate-800">Location</label>
          <input
            id="property-location"
            v-model="location"
            type="text"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="locationError ? 'true' : 'false'"
            aria-describedby="property-location-error"
          />
          <p
            v-if="locationError"
            id="property-location-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ locationError }}
          </p>
        </div>

        <div>
          <label for="property-units" class="block text-sm font-medium text-slate-800"
            >Approximate number of units (optional)</label
          >
          <input
            id="property-units"
            v-model="unitsCount"
            type="number"
            min="0"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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


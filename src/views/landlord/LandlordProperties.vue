<script setup>
import { computed, reactive, ref } from 'vue'
import Badge from '../../components/Badge.vue'
import EmptyState from '../../components/EmptyState.vue'
import FormField from '../../components/FormField.vue'
import Modal from '../../components/Modal.vue'
import Table from '../../components/Table.vue'
import emptyTenants from '../../assets/placeholders/empty-tenants.svg'
import { useAuthStore } from '../../stores/auth'
import { usePropertiesStore } from '../../stores/properties'
import { useUnitsStore } from '../../stores/units'

const auth = useAuthStore()
const propertiesStore = usePropertiesStore()
const unitsStore = useUnitsStore()

const modalOpen = ref(false)
const editId = ref('')
const regenerateId = ref('')
const form = reactive({
  name: '',
  category: 'apartment',
  location: '',
  unitsCount: 1,
})

const landlordId = computed(() => auth.currentUser.id)
const myProperties = computed(() => propertiesStore.items.filter((property) => property.landlordId === landlordId.value))
const columns = [
  { key: 'name', label: 'Property' },
  { key: 'category', label: 'Category' },
  { key: 'location', label: 'Location' },
  { key: 'units', label: 'Units' },
  { key: 'actions', label: 'Actions' },
]
const regenerateOpen = computed({
  get: () => Boolean(regenerateId.value),
  set: (value) => {
    if (!value) {
      regenerateId.value = ''
    }
  },
})

function openCreate() {
  editId.value = ''
  form.name = ''
  form.category = 'apartment'
  form.location = ''
  form.unitsCount = 1
  modalOpen.value = true
}

function openEdit(row) {
  editId.value = row.id
  form.name = row.name
  form.category = row.category
  form.location = row.location
  form.unitsCount = row.unitsCount
  modalOpen.value = true
}

function saveProperty() {
  const actor = { role: auth.role, id: auth.currentUser.id }
  if (editId.value) {
    propertiesStore.updateProperty(editId.value, { ...form }, actor)
  } else {
    propertiesStore.createProperty(
      {
        landlordId: landlordId.value,
        ...form,
      },
      actor,
    )
  }
  modalOpen.value = false
}

function propertyUnits(propertyId) {
  return unitsStore.items.filter((unit) => unit.propertyId === propertyId)
}

function regenerate(propertyId) {
  propertiesStore.regenerateUnits(propertyId, { role: auth.role, id: auth.currentUser.id })
  regenerateId.value = ''
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 class="text-3xl font-semibold text-slate-950">
          Properties and unit automation
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Each property generates unit codes automatically from a stable prefix. Family houses are forced to one unit.
        </p>
      </div>
      <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white" @click="openCreate">
        Add property
      </button>
    </div>

    <EmptyState
      v-if="!myProperties.length"
      :image-src="emptyTenants"
      title="No properties yet"
      description="Create your first property to generate units and start assigning tenants."
      action-label="Add property"
      @action="openCreate"
    />

    <Table v-else :columns="columns" :rows="myProperties">
      <template #name="{ row }">
        <div>
          <p class="font-medium text-slate-950">{{ row.name }}</p>
          <p class="text-xs text-slate-500">Prefix {{ row.prefixCode }}</p>
        </div>
      </template>
      <template #category="{ row }">
        <Badge :kind="row.category" />
      </template>
      <template #units="{ row }">
        <div class="space-y-2">
          <p class="text-sm font-medium text-slate-950">{{ propertyUnits(row.id).length }} generated unit(s)</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="unit in propertyUnits(row.id)"
              :key="unit.id"
              class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              {{ unit.code }} - {{ unit.status }}
            </span>
          </div>
        </div>
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="openEdit(row)">
            Edit
          </button>
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="regenerateId = row.id">
            Regenerate units
          </button>
        </div>
      </template>
    </Table>

    <Modal v-model="modalOpen" :title="editId ? 'Edit property' : 'Create property'">
      <div class="grid gap-4 md:grid-cols-2">
        <FormField field-id="property-name" label="Property name" hint="The prefix code stays stable until you regenerate units.">
          <input id="property-name" v-model="form.name" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="property-category" label="Category">
          <select id="property-category" v-model="form.category" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
            <option value="apartment">Apartment</option>
            <option value="family_house">Family house</option>
            <option value="ghetto">Ghetto</option>
          </select>
        </FormField>
        <FormField field-id="property-location" label="Location">
          <input id="property-location" v-model="form.location" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="units-count" label="Units count" hint="Family houses are forced to one unit automatically.">
          <input id="units-count" v-model.number="form.unitsCount" :disabled="form.category === 'family_house'" type="number" min="1" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
      </div>
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm" @click="modalOpen = false">
          Cancel
        </button>
        <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" @click="saveProperty">
          Save property
        </button>
      </div>
    </Modal>

    <Modal v-model="regenerateOpen" title="Regenerate units">
      <p class="text-sm leading-6 text-slate-600">
        Regenerating units keeps the stable prefix code but rebuilds the numbered unit list. This only works when the
        property has no occupied units.
      </p>
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm" @click="regenerateId = ''">
          Cancel
        </button>
        <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" @click="regenerate(regenerateId)">
          Regenerate
        </button>
      </div>
    </Modal>
  </section>
</template>

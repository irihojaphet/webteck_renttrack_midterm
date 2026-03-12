<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import BadgeStatus from '../../components/BadgeStatus.vue'
import BaseModal from '../../components/BaseModal.vue'
import { useAuthStore } from '../../stores/auth'
import { useTenantsStore } from '../../stores/tenants'
import { useTicketsStore } from '../../stores/tickets'
import { usePropertiesStore } from '../../stores/properties'

const auth = useAuthStore()
const tenantsStore = useTenantsStore()
const ticketsStore = useTicketsStore()
const propertiesStore = usePropertiesStore()

const tenantRecord = computed(() =>
  tenantsStore.items.find((t) => t.email === auth.currentUser?.email) || null,
)

const myTickets = computed(() =>
  tenantRecord.value
    ? ticketsStore.items
        .filter((t) => t.tenantId === tenantRecord.value.id)
        .sort((a, b) => (a.createdAt && b.createdAt ? (a.createdAt < b.createdAt ? 1 : -1) : 0))
    : [],
)

const isModalOpen = ref(false)
const selectedTicket = ref(null)

const title = ref('')
const category = ref('')
const priority = ref('Medium')
const description = ref('')
const photos = ref([])

const titleError = ref('')

function canEdit(ticket) {
  return ticket.status === 'Open'
}

function openCreate() {
  selectedTicket.value = null
  title.value = ''
  category.value = ''
  priority.value = 'Medium'
  description.value = ''
  photos.value = []
  titleError.value = ''
  isModalOpen.value = true
}

function openEdit(ticket) {
  if (!canEdit(ticket)) return
  selectedTicket.value = ticket
  title.value = ticket.title
  category.value = ticket.category || ''
  priority.value = ticket.priority || 'Medium'
  description.value = ticket.description || ''
  photos.value = Array.isArray(ticket.photos) ? [...ticket.photos] : []
  titleError.value = ''
  isModalOpen.value = true
}

function validate() {
  titleError.value = ''
  if (!title.value.trim()) {
    titleError.value = 'Please briefly describe the issue.'
    return false
  }
  return true
}

function handleFileChange(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const readers = files.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      }),
  )

  Promise.all(readers).then((results) => {
    photos.value = results
  })
}

function save() {
  if (!validate() || !tenantRecord.value) return

  const base = {
    tenantId: tenantRecord.value.id,
    propertyId: tenantRecord.value.propertyId,
    title: title.value.trim(),
    category: category.value.trim() || 'General',
    priority: priority.value,
    description: description.value.trim() || undefined,
    photos: photos.value,
  }

  if (selectedTicket.value) {
    if (!canEdit(selectedTicket.value)) return
    ticketsStore.edit(selectedTicket.value.id, base)
  } else {
    ticketsStore.add({
      ...base,
      status: 'Open',
    })
  }

  isModalOpen.value = false
}

function deleteTicket(ticket) {
  if (!canEdit(ticket)) return
  if (window.confirm('Delete this ticket? You will no longer see it in your list.')) {
    ticketsStore.removeById(ticket.id)
  }
}
</script>

<template>
  <section aria-labelledby="tenant-maintenance-title">
    <PageHeader
      id="tenant-maintenance-title"
      title="My maintenance tickets"
      subtitle="Create and track maintenance requests for your home."
    />

    <p v-if="!tenantRecord" class="mb-4 text-sm text-slate-600">
      We could not find a tenant record linked to your account. Maintenance tickets will be available once your
      landlord links you to a unit.
    </p>

    <div class="mb-4 flex justify-end">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        :disabled="!tenantRecord"
        @click="openCreate"
      >
        New ticket
      </button>
    </div>

    <div
      v-if="!myTickets.length"
      class="text-sm text-slate-600"
    >
      You have not submitted any maintenance requests yet.
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <article
        v-for="ticket in myTickets"
        :key="ticket.id"
        class="rounded-lg border border-slate-200 bg-white p-4"
      >
        <header class="flex items-start justify-between gap-2">
          <div>
            <h2 class="text-sm font-semibold text-slate-900">
              {{ ticket.title }}
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              {{ ticket.category }} · {{ ticket.priority }}
            </p>
            <p class="mt-0.5 text-xs text-slate-500">
              Created on {{ ticket.createdAt?.slice(0, 10) }}
            </p>
            <p v-if="ticket.propertyId" class="mt-0.5 text-xs text-slate-500">
              {{
                propertiesStore.byId.get(ticket.propertyId)?.name ||
                'Linked property not available'
              }}
            </p>
          </div>
          <div class="text-right">
            <BadgeStatus :kind="ticket.status" />
          </div>
        </header>

        <p
          v-if="ticket.description"
          class="mt-2 text-sm text-slate-700"
        >
          {{ ticket.description }}
        </p>

        <div
          v-if="Array.isArray(ticket.photos) && ticket.photos.length"
          class="mt-2 flex flex-wrap gap-2"
        >
          <figure
            v-for="(photo, index) in ticket.photos"
            :key="index"
            class="h-16 w-16 overflow-hidden rounded-md border border-slate-200"
          >
            <img
              :src="photo"
              alt="Uploaded maintenance photo preview"
              class="h-full w-full object-cover"
            />
          </figure>
        </div>

        <footer class="mt-3 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canEdit(ticket)"
            @click="openEdit(ticket)"
          >
            Edit
          </button>
          <button
            type="button"
            class="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canEdit(ticket)"
            @click="deleteTicket(ticket)"
          >
            Delete
          </button>
        </footer>
      </article>
    </div>

    <BaseModal
      v-model="isModalOpen"
      :title="selectedTicket ? 'Edit ticket' : 'New maintenance ticket'"
    >
      <form
        class="space-y-3"
        @submit.prevent="save"
      >
        <div>
          <label for="ticket-title" class="block text-sm font-medium text-slate-800">Title</label>
          <input
            id="ticket-title"
            v-model="title"
            type="text"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="titleError ? 'true' : 'false'"
            aria-describedby="ticket-title-error"
          />
          <p
            v-if="titleError"
            id="ticket-title-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ titleError }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label for="ticket-category" class="block text-sm font-medium text-slate-800">Category</label>
            <select
              id="ticket-category"
              v-model="category"
              class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose a category</option>
              <option>Plumbing</option>
              <option>Electricity</option>
              <option>Appliances</option>
              <option>Security</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label for="ticket-priority" class="block text-sm font-medium text-slate-800">Priority</label>
            <select
              id="ticket-priority"
              v-model="priority"
              class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div>
          <label for="ticket-description" class="block text-sm font-medium text-slate-800">Description</label>
          <textarea
            id="ticket-description"
            v-model="description"
            rows="4"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div>
          <label for="ticket-photos" class="block text-sm font-medium text-slate-800"
            >Photos (optional, not uploaded to a server)</label
          >
          <input
            id="ticket-photos"
            type="file"
            accept="image/*"
            multiple
            class="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-slate-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-100"
            @change="handleFileChange"
          />
          <p class="mt-1 text-xs text-slate-500">
            Images are stored locally in your browser and never sent to a server.
          </p>
          <div
            v-if="photos.length"
            class="mt-2 flex flex-wrap gap-2"
          >
            <figure
              v-for="(photo, index) in photos"
              :key="index"
              class="h-16 w-16 overflow-hidden rounded-md border border-slate-200"
            >
              <img
                :src="photo"
                alt="Selected photo preview"
                class="h-full w-full object-cover"
              />
            </figure>
          </div>
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
          Save ticket
        </button>
      </template>
    </BaseModal>
  </section>
</template>


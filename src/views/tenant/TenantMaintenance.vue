<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Badge from '../../components/Badge.vue'
import EmptyState from '../../components/EmptyState.vue'
import FileUploadWithPreview from '../../components/FileUploadWithPreview.vue'
import FormField from '../../components/FormField.vue'
import Table from '../../components/Table.vue'
import emptyTickets from '../../assets/placeholders/empty-tickets.svg'
import { useSessionEntities } from '../../composables/useSessionEntities'
import { useChatsStore } from '../../stores/chats'
import { useTicketsStore } from '../../stores/tickets'

const router = useRouter()
const { auth, currentLease, currentTenant } = useSessionEntities()
const ticketsStore = useTicketsStore()
const chatsStore = useChatsStore()

const form = reactive({
  title: '',
  category: 'Plumbing',
  priority: 'Medium',
  description: '',
  proofImages: [],
})

const rows = computed(() =>
  ticketsStore.items
    .filter((ticket) => ticket.tenantId === currentTenant.value?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const columns = [
  { key: 'title', label: 'Issue' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function submitTicket() {
  if (!currentTenant.value || !currentLease.value) return
  ticketsStore.createTicket(
    {
      landlordId: currentLease.value.landlordId,
      tenantId: currentTenant.value.id,
      propertyId: currentLease.value.propertyId,
      unitId: currentLease.value.unitId,
      ...form,
    },
    { role: auth.role, id: currentTenant.value.id },
  )
  form.title = ''
  form.category = 'Plumbing'
  form.priority = 'Medium'
  form.description = ''
  form.proofImages = []
}

function reopenTicket(ticketId) {
  ticketsStore.reopen(ticketId, { role: auth.role, id: currentTenant.value.id })
}

function confirmResolved(ticketId) {
  ticketsStore.updateStatus(ticketId, 'Resolved', { role: auth.role, id: currentTenant.value.id })
}

function openChat(row) {
  const thread = chatsStore.getOrCreateThread({
    landlordId: row.landlordId,
    tenantId: row.tenantId,
    contextType: 'maintenance_ticket',
    contextId: row.id,
    subject: row.title,
  })
  router.push(`/tenant/chat?thread=${thread.id}`)
}
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-3xl font-semibold text-slate-950">
          Create maintenance claim
        </h1>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          Describe the issue, attach optional images, and track status updates from your landlord.
        </p>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <FormField field-id="ticket-title" label="Title">
            <input id="ticket-title" v-model="form.title" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </FormField>
          <FormField field-id="ticket-category" label="Category">
            <select id="ticket-category" v-model="form.category" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Security</option>
              <option>Cleaning</option>
              <option>General</option>
            </select>
          </FormField>
          <FormField field-id="ticket-priority" label="Priority">
            <select id="ticket-priority" v-model="form.priority" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </FormField>
          <FormField field-id="ticket-images" label="Proof images">
            <FileUploadWithPreview v-model="form.proofImages" field-id="ticket-images" multiple />
          </FormField>
          <div class="md:col-span-2">
            <FormField field-id="ticket-description" label="Description">
              <textarea id="ticket-description" v-model="form.description" rows="4" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"></textarea>
            </FormField>
          </div>
        </div>
        <button type="button" class="mt-5 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white" @click="submitTicket">
          Submit ticket
        </button>
      </section>

      <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-950">
          Ticket history
        </h2>
        <EmptyState
          v-if="!rows.length"
          :image-src="emptyTickets"
          title="No tickets submitted"
          description="Your maintenance history will appear here after you submit the first claim."
        />
        <Table v-else :columns="columns" :rows="rows">
          <template #title="{ row }">
            <div>
              <p class="font-medium text-slate-950">{{ row.title }}</p>
              <p class="text-xs text-slate-500">{{ row.category }}</p>
            </div>
          </template>
          <template #status="{ row }">
            <Badge :kind="row.status" />
          </template>
          <template #actions="{ row }">
            <div class="flex flex-wrap gap-2">
              <button v-if="row.status === 'Resolved'" type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="confirmResolved(row.id)">
                Confirm resolved
              </button>
              <button v-if="row.status === 'Resolved' && row.reopenCount < 1" type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="reopenTicket(row.id)">
                Reopen once
              </button>
              <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="openChat(row)">
                Chat
              </button>
            </div>
          </template>
        </Table>
      </section>
    </div>
  </section>
</template>

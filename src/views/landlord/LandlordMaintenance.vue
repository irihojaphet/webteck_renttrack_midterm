<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Badge from '../../components/Badge.vue'
import Table from '../../components/Table.vue'
import { useAuthStore } from '../../stores/auth'
import { useChatsStore } from '../../stores/chats'
import { useTenantsStore } from '../../stores/tenants'
import { useTicketsStore } from '../../stores/tickets'

const router = useRouter()
const auth = useAuthStore()
const ticketsStore = useTicketsStore()
const tenantsStore = useTenantsStore()
const chatsStore = useChatsStore()

const rows = computed(() =>
  ticketsStore.items
    .filter((ticket) => ticket.landlordId === auth.currentUser.id)
    .map((ticket) => ({
      ...ticket,
      tenant: tenantsStore.items.find((tenant) => tenant.id === ticket.tenantId),
    })),
)

const columns = [
  { key: 'title', label: 'Issue' },
  { key: 'tenant', label: 'Tenant' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function updateStatus(id, status) {
  ticketsStore.updateStatus(id, status, { role: auth.role, id: auth.currentUser.id })
}

function openChat(row) {
  const thread = chatsStore.getOrCreateThread({
    landlordId: row.landlordId,
    tenantId: row.tenantId,
    contextType: 'maintenance_ticket',
    contextId: row.id,
    subject: row.title,
  })
  router.push(`/landlord/chat?thread=${thread.id}`)
}
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-3xl font-semibold text-slate-950">
        Maintenance claims
      </h1>
    </div>

    <Table :columns="columns" :rows="rows">
      <template #title="{ row }">
        <div class="space-y-2">
          <p class="font-medium text-slate-950">{{ row.title }}</p>
          <p class="text-xs leading-5 text-slate-500">{{ row.description }}</p>
          <div class="flex gap-2">
            <img
              v-for="image in row.proofImages"
              :key="image"
              :src="image"
              alt=""
              class="h-16 w-20 rounded-xl border border-slate-200 object-cover"
            />
          </div>
        </div>
      </template>
      <template #tenant="{ row }">
        {{ row.tenant?.fullName }}
      </template>
      <template #status="{ row }">
        <Badge :kind="row.status" />
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="updateStatus(row.id, 'InProgress')">
            In progress
          </button>
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="updateStatus(row.id, 'Resolved')">
            Resolve
          </button>
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="openChat(row)">
            Chat
          </button>
        </div>
      </template>
    </Table>
  </section>
</template>

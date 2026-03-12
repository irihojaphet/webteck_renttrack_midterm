<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import BadgeStatus from '../../components/BadgeStatus.vue'
import { useTicketsStore } from '../../stores/tickets'
import { useTenantsStore } from '../../stores/tenants'
import { usePropertiesStore } from '../../stores/properties'

const ticketsStore = useTicketsStore()
const tenantsStore = useTenantsStore()
const propertiesStore = usePropertiesStore()

const search = ref('')
const statusFilter = ref('all')

const ticketsWithContext = computed(() =>
  ticketsStore.items
    .slice()
    .sort((a, b) => (a.createdAt && b.createdAt ? (a.createdAt < b.createdAt ? 1 : -1) : 0))
    .map((ticket) => ({
      ...ticket,
      tenant: tenantsStore.byId.get(ticket.tenantId) || null,
      property: propertiesStore.byId.get(ticket.propertyId) || null,
    })),
)

const filteredTickets = computed(() => {
  const term = search.value.trim().toLowerCase()
  const status = statusFilter.value
  return ticketsWithContext.value.filter((t) => {
    if (status !== 'all' && t.status !== status) return false
    if (!term) return true
    const pieces = [
      t.title,
      t.category,
      t.priority,
      t.status,
      t.tenant?.fullName,
      t.property?.name,
      t.property?.location,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return pieces.includes(term)
  })
})

function updateStatus(ticket, newStatus) {
  ticketsStore.edit(ticket.id, { status: newStatus })
}
</script>

<template>
  <section aria-labelledby="landlord-maintenance-title">
    <PageHeader
      id="landlord-maintenance-title"
      title="Maintenance tickets"
      subtitle="Review and update maintenance requests submitted by tenants."
    />

    <div class="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <label class="flex-1 text-sm">
        <span class="sr-only">Search tickets</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search by tenant, property, title, or status"
          class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <label class="text-sm">
        <span class="mr-2 text-slate-700">Status</span>
        <select
          v-model="statusFilter"
          class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All</option>
          <option value="Open">Open</option>
          <option value="InProgress">In progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </label>
    </div>

    <div v-if="!ticketsStore.items.length" class="mt-4">
      <EmptyState
        title="No maintenance tickets yet"
        description="When tenants submit maintenance requests, they will appear here for you to triage."
        action-label=""
      />
    </div>

    <div v-else>
      <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th scope="col" class="px-3 py-2">Created</th>
              <th scope="col" class="px-3 py-2">Tenant</th>
              <th scope="col" class="px-3 py-2">Property</th>
              <th scope="col" class="px-3 py-2">Request</th>
              <th scope="col" class="px-3 py-2">Priority</th>
              <th scope="col" class="px-3 py-2">Status</th>
              <th scope="col" class="px-3 py-2 text-right">Update status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="border-t border-slate-100 align-top hover:bg-slate-50"
            >
              <td class="px-3 py-2 text-xs text-slate-500">
                {{ ticket.createdAt?.slice(0, 10) }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                <p>{{ ticket.tenant?.fullName || 'Unknown tenant' }}</p>
              </td>
              <td class="px-3 py-2 text-slate-700">
                <p>{{ ticket.property?.name || 'Unknown property' }}</p>
                <p v-if="ticket.property?.location" class="text-xs text-slate-500">
                  {{ ticket.property.location }}
                </p>
              </td>
              <td class="px-3 py-2 text-slate-700">
                <p class="font-medium text-slate-900">
                  {{ ticket.title }}
                </p>
                <p v-if="ticket.description" class="mt-1 text-xs text-slate-600">
                  {{ ticket.description }}
                </p>
              </td>
              <td class="px-3 py-2 text-xs text-slate-700">
                {{ ticket.category }} · {{ ticket.priority }}
              </td>
              <td class="px-3 py-2">
                <BadgeStatus :kind="ticket.status" />
              </td>
              <td class="px-3 py-2 text-right">
                <div class="inline-flex gap-2">
                  <button
                    type="button"
                    class="rounded-md border border-sky-200 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                    :disabled="ticket.status === 'Open'"
                    @click="updateStatus(ticket, 'Open')"
                  >
                    Mark open
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-amber-200 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                    :disabled="ticket.status === 'InProgress'"
                    @click="updateStatus(ticket, 'InProgress')"
                  >
                    In progress
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    :disabled="ticket.status === 'Resolved'"
                    @click="updateStatus(ticket, 'Resolved')"
                  >
                    Resolved
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>


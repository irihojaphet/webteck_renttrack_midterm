<script setup>
import { computed } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import BadgeStatus from '../../components/BadgeStatus.vue'
import { useAuthStore } from '../../stores/auth'
import { useTenantsStore } from '../../stores/tenants'
import { useLeasesStore } from '../../stores/leases'
import { usePaymentsStore } from '../../stores/payments'
import { useTicketsStore } from '../../stores/tickets'
import { usePropertiesStore } from '../../stores/properties'

const auth = useAuthStore()
const tenantsStore = useTenantsStore()
const leasesStore = useLeasesStore()
const paymentsStore = usePaymentsStore()
const ticketsStore = useTicketsStore()
const propertiesStore = usePropertiesStore()

const tenantRecord = computed(() =>
  tenantsStore.items.find((t) => t.email === auth.currentUser?.email) || null,
)

const activeLease = computed(() =>
  tenantRecord.value
    ? leasesStore.items.find((l) => l.tenantId === tenantRecord.value.id && l.status === 'active') || null
    : null,
)

const currentProperty = computed(() =>
  activeLease.value ? propertiesStore.byId.get(activeLease.value.propertyId) || null : null,
)

const myPayments = computed(() =>
  tenantRecord.value
    ? paymentsStore.items
        .filter((p) => p.tenantId === tenantRecord.value.id)
        .sort((a, b) => (a.month === b.month ? 0 : a.month < b.month ? 1 : -1))
    : [],
)

const myTickets = computed(() =>
  tenantRecord.value
    ? ticketsStore.items.filter((t) => t.tenantId === tenantRecord.value.id)
    : [],
)

const openTicketsCount = computed(() => myTickets.value.filter((t) => t.status === 'Open').length)
</script>

<template>
  <section aria-labelledby="tenant-dashboard-title">
    <PageHeader
      id="tenant-dashboard-title"
      title="Your rent and maintenance"
      :subtitle="
        tenantRecord
          ? `Welcome back, ${tenantRecord.fullName}. Here’s a quick view of your rent and maintenance tickets.`
          : 'Welcome back. This dashboard summarises your current lease, recent payments, and maintenance tickets.'
      "
    />

    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Monthly rent"
        :value="
          activeLease
            ? Number(activeLease.monthlyRent).toLocaleString() + ' RWF'
            : 'No active lease'
        "
        :hint="activeLease ? 'Amount expected each month under your current lease.' : 'Ask your landlord to confirm your lease details.'"
      />
      <StatCard
        label="Payments recorded"
        :value="myPayments.length"
        hint="Total number of rent payments visible to you."
      />
      <StatCard
        label="Open maintenance tickets"
        :value="openTicketsCount"
        hint="Tickets that are still marked as Open."
      />
    </div>

    <section class="mb-6 rounded-lg border border-slate-200 bg-white p-4">
      <h2 class="text-sm font-semibold text-slate-900">
        Current home
      </h2>
      <p v-if="!activeLease || !currentProperty" class="mt-2 text-sm text-slate-600">
        We could not find an active lease linked to your account. If you believe this is a mistake, please contact
        your landlord.
      </p>
      <div v-else class="mt-2 text-sm text-slate-700">
        <p class="font-medium text-slate-900">
          {{ currentProperty.name }}
        </p>
        <p class="text-slate-600">
          {{ currentProperty.location }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          Lease started on
          <span class="font-medium">{{ activeLease.startDate }}</span>
        </p>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h2 class="text-sm font-semibold text-slate-900">
          Recent payments
        </h2>
        <p v-if="!myPayments.length" class="mt-2 text-sm text-slate-600">
          You have no payments recorded yet.
        </p>
        <div v-else class="mt-3 overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th scope="col" class="px-3 py-2">Month</th>
                <th scope="col" class="px-3 py-2">Amount</th>
                <th scope="col" class="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="payment in myPayments.slice(0, 5)"
                :key="payment.id"
                class="border-t border-slate-100 hover:bg-slate-50"
              >
                <td class="px-3 py-2 text-slate-900">
                  {{ payment.month }}
                </td>
                <td class="px-3 py-2 text-slate-700">
                  {{ Number(payment.amountPaid).toLocaleString() }} RWF
                </td>
                <td class="px-3 py-2">
                  <BadgeStatus :kind="payment.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="rounded-lg border border-slate-200 bg-white p-4">
        <h2 class="text-sm font-semibold text-slate-900">
          Your maintenance tickets
        </h2>
        <p v-if="!myTickets.length" class="mt-2 text-sm text-slate-600">
          You have not submitted any maintenance tickets yet. Use the “My tickets” section to create one when
          something needs attention.
        </p>
        <div v-else class="mt-3 overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th scope="col" class="px-3 py-2">Created</th>
                <th scope="col" class="px-3 py-2">Title</th>
                <th scope="col" class="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="ticket in myTickets.slice(0, 5)"
                :key="ticket.id"
                class="border-t border-slate-100 hover:bg-slate-50"
              >
                <td class="px-3 py-2 text-xs text-slate-500">
                  {{ ticket.createdAt?.slice(0, 10) }}
                </td>
                <td class="px-3 py-2 text-slate-900">
                  {{ ticket.title }}
                </td>
                <td class="px-3 py-2">
                  <BadgeStatus :kind="ticket.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  </section>
</template>


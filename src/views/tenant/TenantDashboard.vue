<script setup>
import { computed } from 'vue'
import Badge from '../../components/Badge.vue'
import StatCard from '../../components/StatCard.vue'
import Table from '../../components/Table.vue'
import { useSessionEntities } from '../../composables/useSessionEntities'
import { usePaymentProofsStore } from '../../stores/paymentProofs'
import { usePaymentsStore } from '../../stores/payments'
import { useTicketsStore } from '../../stores/tickets'

const { currentTenant, currentLease, currentProperty, currentUnit } = useSessionEntities()
const paymentsStore = usePaymentsStore()
const paymentProofsStore = usePaymentProofsStore()
const ticketsStore = useTicketsStore()

const myPayments = computed(() =>
  paymentsStore.items
    .filter((payment) => payment.tenantId === currentTenant.value?.id)
    .sort((a, b) => b.month.localeCompare(a.month)),
)
const myProofs = computed(() =>
  paymentProofsStore.items
    .filter((proof) => proof.tenantId === currentTenant.value?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)
const myTickets = computed(() => ticketsStore.items.filter((ticket) => ticket.tenantId === currentTenant.value?.id))
const paymentColumns = [
  { key: 'month', label: 'Month' },
  { key: 'amountPaid', label: 'Amount' },
  { key: 'status', label: 'Status' },
]
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">
        Tenant overview
      </p>
      <h1 class="mt-3 text-3xl font-semibold text-slate-950">
        Follow your lease, rent proof, and maintenance requests.
      </h1>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Home" :value="currentProperty?.name || 'No active lease'" tone="indigo" />
      <StatCard label="Unit" :value="currentUnit?.code || 'Not assigned'" tone="slate" />
      <StatCard label="Monthly rent" :value="currentLease ? `${Number(currentLease.monthlyRent).toLocaleString()} RWF` : '0 RWF'" tone="emerald" />
      <StatCard label="Pending proofs" :value="myProofs.filter((proof) => proof.status === 'Pending').length" tone="amber" />
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
      <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-950">
          Active lease
        </h2>
        <div v-if="currentLease" class="mt-4 space-y-3 text-sm text-slate-600">
          <p>
            <span class="font-medium text-slate-950">Property:</span>
            {{ currentProperty?.name }}
          </p>
          <p>
            <span class="font-medium text-slate-950">Location:</span>
            {{ currentProperty?.location }}
          </p>
          <p>
            <span class="font-medium text-slate-950">Unit:</span>
            {{ currentUnit?.code }}
          </p>
          <p>
            <span class="font-medium text-slate-950">Start date:</span>
            {{ currentLease.startDate }}
          </p>
        </div>
      </section>

      <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-950">
          My tickets
        </h2>
        <div class="mt-4 space-y-3">
          <article v-for="ticket in myTickets" :key="ticket.id" class="rounded-[24px] bg-slate-50 p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="font-medium text-slate-950">{{ ticket.title }}</p>
              <Badge :kind="ticket.status" />
            </div>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              {{ ticket.description }}
            </p>
          </article>
        </div>
      </section>
    </div>

    <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-slate-950">
        Payment history
      </h2>
      <div class="mt-4">
        <Table :columns="paymentColumns" :rows="myPayments">
          <template #amountPaid="{ row }">
            {{ Number(row.amountPaid).toLocaleString() }} RWF
          </template>
          <template #status="{ row }">
            <Badge :kind="row.status" />
          </template>
        </Table>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import BadgeStatus from '../../components/BadgeStatus.vue'
import { useAuthStore } from '../../stores/auth'
import { useTenantsStore } from '../../stores/tenants'
import { usePaymentsStore } from '../../stores/payments'

const auth = useAuthStore()
const tenantsStore = useTenantsStore()
const paymentsStore = usePaymentsStore()

const tenantRecord = computed(() =>
  tenantsStore.items.find((t) => t.email === auth.currentUser?.email) || null,
)

const myPayments = computed(() =>
  tenantRecord.value
    ? paymentsStore.items
        .filter((p) => p.tenantId === tenantRecord.value.id)
        .sort((a, b) => (a.month === b.month ? 0 : a.month < b.month ? 1 : -1))
    : [],
)
</script>

<template>
  <section aria-labelledby="tenant-payments-title">
    <PageHeader
      id="tenant-payments-title"
      title="My payments"
      subtitle="Review the rent payments that have been recorded for your lease."
    />

    <p v-if="!tenantRecord" class="mb-3 text-sm text-slate-600">
      We were not able to find a tenant record linked to your account. Payments will appear once your landlord links
      you to a lease.
    </p>

    <div v-if="!myPayments.length" class="mt-4 text-sm text-slate-600">
      There are no payments recorded for you yet.
    </div>

    <div v-else class="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th scope="col" class="px-3 py-2">Month</th>
            <th scope="col" class="px-3 py-2">Amount</th>
            <th scope="col" class="px-3 py-2">Status</th>
            <th scope="col" class="px-3 py-2">Recorded on</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="payment in myPayments"
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
            <td class="px-3 py-2 text-xs text-slate-500">
              {{ payment.createdAt?.slice(0, 10) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>


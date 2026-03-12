<script setup>
import { computed, ref, watch } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import BadgeStatus from '../../components/BadgeStatus.vue'
import { usePaymentsStore } from '../../stores/payments'
import { useLeasesStore } from '../../stores/leases'
import { useTenantsStore } from '../../stores/tenants'
import { usePropertiesStore } from '../../stores/properties'

const paymentsStore = usePaymentsStore()
const leasesStore = useLeasesStore()
const tenantsStore = useTenantsStore()
const propertiesStore = usePropertiesStore()

const leaseId = ref('')
const month = ref('')
const amountPaid = ref('')

const leaseError = ref('')
const monthError = ref('')
const amountError = ref('')

const search = ref('')

const leasesWithContext = computed(() =>
  leasesStore.items
    .filter((l) => l.status === 'active')
    .map((lease) => ({
      ...lease,
      tenant: tenantsStore.byId.get(lease.tenantId) || null,
      property: propertiesStore.byId.get(lease.propertyId) || null,
    })),
)

const selectedLease = computed(() =>
  leasesWithContext.value.find((l) => l.id === leaseId.value) || null,
)

const computedStatus = computed(() => {
  const lease = selectedLease.value
  if (!lease) return null
  const rent = Number(lease.monthlyRent || 0)
  const paid = Number(amountPaid.value || 0)
  if (paid >= rent && rent > 0) return 'Paid'
  if (paid > 0 && paid < rent) return 'Partial'
  if (paid === 0) return 'Late'
  return null
})

watch(
  () => leasesWithContext.value,
  (list) => {
    if (!leaseId.value && list.length) {
      leaseId.value = list[0].id
    }
  },
  { immediate: true },
)

function validate() {
  leaseError.value = ''
  monthError.value = ''
  amountError.value = ''

  let ok = true
  if (!leaseId.value) {
    leaseError.value = 'Please choose a lease.'
    ok = false
  }
  if (!month.value) {
    monthError.value = 'Please choose the month this payment applies to.'
    ok = false
  }
  if (amountPaid.value === '' || Number(amountPaid.value) < 0) {
    amountError.value = 'Amount cannot be negative.'
    ok = false
  }
  return ok
}

function recordPayment() {
  if (!validate()) return
  const lease = selectedLease.value
  if (!lease) return

  const status = computedStatus.value || 'Late'

  paymentsStore.add({
    leaseId: lease.id,
    tenantId: lease.tenantId,
    month: month.value,
    amountPaid: Number(amountPaid.value),
    status,
  })

  // reset amount only, keep context
  amountPaid.value = ''
}

const paymentsWithContext = computed(() =>
  paymentsStore.items
    .slice()
    .sort((a, b) => (a.month === b.month ? 0 : a.month < b.month ? 1 : -1))
    .map((payment) => {
      const lease = leasesStore.byId.get(payment.leaseId)
      const tenant = lease ? tenantsStore.byId.get(lease.tenantId) : null
      const property = lease ? propertiesStore.byId.get(lease.propertyId) : null
      return {
        ...payment,
        lease,
        tenant,
        property,
      }
    }),
)

const filteredPayments = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return paymentsWithContext.value
  return paymentsWithContext.value.filter((p) => {
    const pieces = [
      p.month,
      p.status,
      p.tenant?.fullName,
      p.tenant?.email,
      p.property?.name,
      p.property?.location,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return pieces.includes(term)
  })
})
</script>

<template>
  <section aria-labelledby="landlord-payments-title">
    <PageHeader
      id="landlord-payments-title"
      title="Payments"
      subtitle="Record rent payments and see which months are Paid, Partial, or Late."
    />

    <section class="mb-6 rounded-lg border border-slate-200 bg-white p-4">
      <h2 class="text-sm font-semibold text-slate-900">
        Record a payment
      </h2>

      <form
        class="mt-3 grid gap-3 md:grid-cols-4"
        @submit.prevent="recordPayment"
      >
        <div class="md:col-span-2">
          <label for="payment-lease" class="block text-xs font-medium uppercase tracking-wide text-slate-700">
            Lease (tenant and property)
          </label>
          <select
            id="payment-lease"
            v-model="leaseId"
            class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="leaseError ? 'true' : 'false'"
            aria-describedby="payment-lease-error"
          >
            <option value="" disabled>Select an active lease</option>
            <option
              v-for="lease in leasesWithContext"
              :key="lease.id"
              :value="lease.id"
            >
              {{ lease.tenant?.fullName || 'Unknown tenant' }} — {{ lease.property?.name || 'Unknown property' }}
            </option>
          </select>
          <p
            v-if="leaseError"
            id="payment-lease-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ leaseError }}
          </p>
        </div>

        <div>
          <label for="payment-month" class="block text-xs font-medium uppercase tracking-wide text-slate-700">
            Month
          </label>
          <input
            id="payment-month"
            v-model="month"
            type="month"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="monthError ? 'true' : 'false'"
            aria-describedby="payment-month-error"
          />
          <p
            v-if="monthError"
            id="payment-month-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ monthError }}
          </p>
        </div>

        <div>
          <label for="payment-amount" class="block text-xs font-medium uppercase tracking-wide text-slate-700">
            Amount paid (RWF)
          </label>
          <input
            id="payment-amount"
            v-model="amountPaid"
            type="number"
            min="0"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="amountError ? 'true' : 'false'"
            aria-describedby="payment-amount-error"
          />
          <p
            v-if="amountError"
            id="payment-amount-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ amountError }}
          </p>
        </div>

        <div class="md:self-end">
          <button
            type="submit"
            class="mt-1 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Save payment
          </button>
          <p v-if="selectedLease" class="mt-1 text-xs text-slate-500">
            Expected monthly rent:
            <span class="font-medium">
              {{ Number(selectedLease.monthlyRent).toLocaleString() }} RWF
            </span>
            <span v-if="computedStatus" class="ml-1">
              → status will be
              <BadgeStatus :kind="computedStatus" />
            </span>
          </p>
        </div>
      </form>
    </section>

    <section aria-label="Recorded payments">
      <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-sm font-semibold text-slate-900">
          Payment history
        </h2>
        <label class="flex-1 text-sm sm:max-w-xs">
          <span class="sr-only">Search payments</span>
          <input
            v-model="search"
            type="search"
            placeholder="Search by tenant, property, month, or status"
            class="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
      </div>

      <div v-if="!paymentsStore.items.length" class="mt-2">
        <EmptyState
          title="No payments recorded yet"
          description="Once you start recording rent, the latest months and statuses will appear here."
          action-label=""
        />
      </div>

      <div v-else>
        <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th scope="col" class="px-3 py-2">Month</th>
                <th scope="col" class="px-3 py-2">Tenant</th>
                <th scope="col" class="px-3 py-2">Property</th>
                <th scope="col" class="px-3 py-2">Amount paid</th>
                <th scope="col" class="px-3 py-2">Status</th>
                <th scope="col" class="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="payment in filteredPayments"
                :key="payment.id"
                class="border-t border-slate-100 hover:bg-slate-50"
              >
                <td class="px-3 py-2 text-slate-900">
                  {{ payment.month }}
                </td>
                <td class="px-3 py-2 text-slate-700">
                  <p>{{ payment.tenant?.fullName || 'Unknown tenant' }}</p>
                  <p v-if="payment.tenant?.email" class="text-xs text-slate-500">
                    {{ payment.tenant.email }}
                  </p>
                </td>
                <td class="px-3 py-2 text-slate-700">
                  <p>{{ payment.property?.name || 'Unknown property' }}</p>
                  <p v-if="payment.property?.location" class="text-xs text-slate-500">
                    {{ payment.property.location }}
                  </p>
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
      </div>
    </section>
  </section>
</template>


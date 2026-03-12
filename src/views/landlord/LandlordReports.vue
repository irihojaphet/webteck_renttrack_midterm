<script setup>
import { computed } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import StatCard from '../../components/StatCard.vue'
import { usePaymentsStore } from '../../stores/payments'
import { useExpensesStore } from '../../stores/expenses'

const paymentsStore = usePaymentsStore()
const expensesStore = useExpensesStore()

const totalsByMonth = computed(() => paymentsStore.totalsByMonth)

const months = computed(() => Object.keys(totalsByMonth.value).sort())

const latestMonth = computed(() => (months.value.length ? months.value.at(-1) : null))

const latestCollected = computed(() =>
  latestMonth.value ? totalsByMonth.value[latestMonth.value] || 0 : 0,
)

const totalExpenses = computed(() => expensesStore.totalAmount)

const netForLatestMonth = computed(() => {
  if (!latestMonth.value) return null
  // for simplicity, compare latest collected vs all-time expenses
  return latestCollected.value - totalExpenses.value
})
</script>

<template>
  <section aria-labelledby="landlord-reports-title">
    <PageHeader
      id="landlord-reports-title"
      title="Reports"
      subtitle="High-level overview of rent collected versus expenses."
    />

    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Latest rent month collected"
        :value="latestMonth || '—'"
        :hint="latestMonth ? 'Based on recorded payments' : 'Record payments to start tracking rent.'"
      />
      <StatCard
        label="Total collected (latest month)"
        :value="latestCollected.toLocaleString() + ' RWF'"
        hint="Sum of all payments for the latest recorded month."
      />
      <StatCard
        label="Total expenses (all time)"
        :value="totalExpenses.toLocaleString() + ' RWF'"
        hint="Sum of all property expenses you have recorded."
      />
      <StatCard
        v-if="netForLatestMonth !== null"
        label="Net for latest month"
        :value="netForLatestMonth.toLocaleString() + ' RWF'"
        :hint="netForLatestMonth >= 0 ? 'Positive means rent covers expenses.' : 'Negative means expenses exceed rent.'"
      />
    </div>

    <section class="rounded-lg border border-slate-200 bg-white p-4">
      <h2 class="text-sm font-semibold text-slate-900">
        Monthly collection summary
      </h2>
      <p v-if="!months.length" class="mt-2 text-sm text-slate-600">
        Once you start recording payments, a month-by-month view of rent collected will appear here.
      </p>
      <div v-else class="mt-3 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th scope="col" class="px-3 py-2">Month</th>
              <th scope="col" class="px-3 py-2">Total collected (RWF)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="monthKey in months"
              :key="monthKey"
              class="border-t border-slate-100 hover:bg-slate-50"
            >
              <td class="px-3 py-2 text-slate-900">
                {{ monthKey }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                {{ totalsByMonth[monthKey].toLocaleString() }} RWF
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>


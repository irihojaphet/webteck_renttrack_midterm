<script setup>
import { computed, ref } from 'vue'
import PageHeader from '../../components/PageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import BaseModal from '../../components/BaseModal.vue'
import { useExpensesStore } from '../../stores/expenses'
import { usePropertiesStore } from '../../stores/properties'

const expensesStore = useExpensesStore()
const propertiesStore = usePropertiesStore()

const isModalOpen = ref(false)
const selectedExpense = ref(null)

const propertyId = ref('')
const title = ref('')
const category = ref('')
const amount = ref('')
const date = ref('')
const note = ref('')

const propertyError = ref('')
const titleError = ref('')
const amountError = ref('')

const filterPropertyId = ref('all')

const expensesWithProperty = computed(() =>
  expensesStore.items
    .slice()
    .sort((a, b) => (a.date && b.date ? (a.date < b.date ? 1 : -1) : 0))
    .map((expense) => ({
      ...expense,
      property: propertiesStore.byId.get(expense.propertyId) || null,
    })),
)

const filteredExpenses = computed(() => {
  if (filterPropertyId.value === 'all') return expensesWithProperty.value
  return expensesWithProperty.value.filter((e) => e.propertyId === filterPropertyId.value)
})

const totalVisible = computed(() =>
  filteredExpenses.value.reduce((sum, e) => sum + Number(e.amount || 0), 0),
)

function openCreate() {
  selectedExpense.value = null
  propertyId.value = propertiesStore.items[0]?.id || ''
  title.value = ''
  category.value = ''
  amount.value = ''
  date.value = new Date().toISOString().slice(0, 10)
  note.value = ''
  propertyError.value = ''
  titleError.value = ''
  amountError.value = ''
  isModalOpen.value = true
}

function openEdit(expense) {
  selectedExpense.value = expense
  propertyId.value = expense.propertyId
  title.value = expense.title
  category.value = expense.category || ''
  amount.value = expense.amount
  date.value = expense.date
  note.value = expense.note || ''
  propertyError.value = ''
  titleError.value = ''
  amountError.value = ''
  isModalOpen.value = true
}

function validate() {
  propertyError.value = ''
  titleError.value = ''
  amountError.value = ''

  let ok = true
  if (!propertyId.value) {
    propertyError.value = 'Please choose a property.'
    ok = false
  }
  if (!title.value.trim()) {
    titleError.value = 'Please describe the expense.'
    ok = false
  }
  if (!amount.value || Number(amount.value) <= 0) {
    amountError.value = 'Amount must be greater than zero.'
    ok = false
  }
  return ok
}

function save() {
  if (!validate()) return
  const payload = {
    propertyId: propertyId.value,
    title: title.value.trim(),
    category: category.value.trim() || 'General',
    amount: Number(amount.value),
    date: date.value,
    note: note.value.trim() || undefined,
  }
  if (selectedExpense.value) {
    expensesStore.edit(selectedExpense.value.id, payload)
  } else {
    expensesStore.add(payload)
  }
  isModalOpen.value = false
}

function deleteExpense(expense) {
  if (window.confirm('Delete this expense record?')) {
    expensesStore.removeById(expense.id)
  }
}
</script>

<template>
  <section aria-labelledby="landlord-expenses-title">
    <PageHeader
      id="landlord-expenses-title"
      title="Expenses"
      subtitle="Track maintenance, utilities, and other property-level costs."
    />

    <section class="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-1 gap-2">
        <label class="flex-1 text-sm">
          <span class="sr-only">Filter by property</span>
          <select
            v-model="filterPropertyId"
            class="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All properties</option>
            <option
              v-for="property in propertiesStore.items"
              :key="property.id"
              :value="property.id"
            >
              {{ property.name }} — {{ property.location }}
            </option>
          </select>
        </label>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        @click="openCreate"
      >
        Add expense
      </button>
    </section>

    <p class="mb-3 text-sm text-slate-700">
      Total for current view:
      <span class="font-semibold">
        {{ totalVisible.toLocaleString() }} RWF
      </span>
    </p>

    <div v-if="!expensesStore.items.length" class="mt-4">
      <EmptyState
        title="No expenses recorded"
        description="Capture repairs, utilities, and other running costs so you can compare them against rent collected."
        action-label="Add expense"
        @action="openCreate"
      />
    </div>

    <div v-else>
      <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th scope="col" class="px-3 py-2">Date</th>
              <th scope="col" class="px-3 py-2">Property</th>
              <th scope="col" class="px-3 py-2">Title</th>
              <th scope="col" class="px-3 py-2">Category</th>
              <th scope="col" class="px-3 py-2">Amount</th>
              <th scope="col" class="px-3 py-2">Note</th>
              <th scope="col" class="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="expense in filteredExpenses"
              :key="expense.id"
              class="border-t border-slate-100 hover:bg-slate-50"
            >
              <td class="px-3 py-2 text-xs text-slate-700">
                {{ expense.date }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                <p>{{ expense.property?.name || 'Unknown property' }}</p>
                <p v-if="expense.property?.location" class="text-xs text-slate-500">
                  {{ expense.property.location }}
                </p>
              </td>
              <td class="px-3 py-2 text-slate-900">
                {{ expense.title }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                {{ expense.category }}
              </td>
              <td class="px-3 py-2 text-slate-700">
                {{ Number(expense.amount).toLocaleString() }} RWF
              </td>
              <td class="px-3 py-2 text-xs text-slate-600">
                {{ expense.note || '—' }}
              </td>
              <td class="px-3 py-2 text-right">
                <div class="inline-flex gap-2">
                  <button
                    type="button"
                    class="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    @click="openEdit(expense)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    @click="deleteExpense(expense)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal v-model="isModalOpen" :title="selectedExpense ? 'Edit expense' : 'Add expense'">
      <form
        class="space-y-3"
        @submit.prevent="save"
      >
        <div>
          <label for="expense-property" class="block text-sm font-medium text-slate-800">Property</label>
          <select
            id="expense-property"
            v-model="propertyId"
            class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="propertyError ? 'true' : 'false'"
            aria-describedby="expense-property-error"
          >
            <option value="" disabled>Select a property</option>
            <option
              v-for="property in propertiesStore.items"
              :key="property.id"
              :value="property.id"
            >
              {{ property.name }} — {{ property.location }}
            </option>
          </select>
          <p
            v-if="propertyError"
            id="expense-property-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ propertyError }}
          </p>
        </div>

        <div>
          <label for="expense-title" class="block text-sm font-medium text-slate-800">Title</label>
          <input
            id="expense-title"
            v-model="title"
            type="text"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="titleError ? 'true' : 'false'"
            aria-describedby="expense-title-error"
          />
          <p
            v-if="titleError"
            id="expense-title-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ titleError }}
          </p>
        </div>

        <div>
          <label for="expense-category" class="block text-sm font-medium text-slate-800">Category</label>
          <input
            id="expense-category"
            v-model="category"
            type="text"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Repairs, Utilities, Cleaning"
          />
        </div>

        <div>
          <label for="expense-amount" class="block text-sm font-medium text-slate-800">Amount (RWF)</label>
          <input
            id="expense-amount"
            v-model="amount"
            type="number"
            min="0"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :aria-invalid="amountError ? 'true' : 'false'"
            aria-describedby="expense-amount-error"
          />
          <p
            v-if="amountError"
            id="expense-amount-error"
            class="mt-1 text-xs text-red-700"
            role="alert"
          >
            {{ amountError }}
          </p>
        </div>

        <div>
          <label for="expense-date" class="block text-sm font-medium text-slate-800">Date</label>
          <input
            id="expense-date"
            v-model="date"
            type="date"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label for="expense-note" class="block text-sm font-medium text-slate-800">Internal note (optional)</label>
          <textarea
            id="expense-note"
            v-model="note"
            rows="3"
            class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
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
          Save
        </button>
      </template>
    </BaseModal>
  </section>
</template>


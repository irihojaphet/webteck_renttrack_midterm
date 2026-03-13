<script setup>
import { computed, reactive, ref } from 'vue'
import Badge from '../../components/Badge.vue'
import EmptyState from '../../components/EmptyState.vue'
import FormField from '../../components/FormField.vue'
import Modal from '../../components/Modal.vue'
import Table from '../../components/Table.vue'
import { useAuthStore } from '../../stores/auth'
import { useLandlordsStore } from '../../stores/landlords'
import { useSubscriptionsStore } from '../../stores/subscriptions'
import emptyTenants from '../../assets/placeholders/empty-tenants.svg'

const auth = useAuthStore()
const landlordsStore = useLandlordsStore()
const subscriptionsStore = useSubscriptionsStore()

const modalOpen = ref(false)
const submitting = ref(false)
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  planType: 'annual',
})
const errors = reactive({
  fullName: '',
  email: '',
  password: '',
})

const rows = computed(() =>
  landlordsStore.items.map((landlord) => ({
    ...landlord,
    subscription: subscriptionsStore.getSubscription(landlord.id),
  })),
)

const columns = [
  { key: 'fullName', label: 'Landlord' },
  { key: 'email', label: 'Email' },
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

function resetForm() {
  form.fullName = ''
  form.email = ''
  form.password = ''
  form.planType = 'annual'
  errors.fullName = ''
  errors.email = ''
  errors.password = ''
}

function validate() {
  errors.fullName = form.fullName ? '' : 'Enter the landlord name.'
  errors.email = form.email ? '' : 'Enter a landlord email.'
  errors.password = form.password.length >= 6 ? '' : 'Use at least 6 characters.'
  return !errors.fullName && !errors.email && !errors.password
}

async function createLandlord() {
  if (!validate()) return
  submitting.value = true
  try {
    landlordsStore.createLandlord({
      ...form,
      actorRole: auth.role,
      actorId: auth.currentUser.id,
    })
    modalOpen.value = false
    resetForm()
  } catch (error) {
    errors.email = error.message || 'Unable to create landlord.'
  } finally {
    submitting.value = false
  }
}

function markPaid(row) {
  subscriptionsStore.markPaid({
    landlordId: row.id,
    planType: row.subscription?.planType || 'annual',
    actorRole: auth.role,
    actorId: auth.currentUser.id,
  })
}

function markUnpaid(row) {
  subscriptionsStore.markUnpaid({
    landlordId: row.id,
    planType: row.subscription?.planType || 'annual',
    actorRole: auth.role,
    actorId: auth.currentUser.id,
  })
}

function renewAnnual(row) {
  subscriptionsStore.renewAnnual({
    landlordId: row.id,
    actorRole: auth.role,
    actorId: auth.currentUser.id,
  })
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Account operations
        </p>
        <h1 class="mt-2 text-3xl font-semibold text-slate-950">
          Create landlord accounts and manage subscription access.
        </h1>
      </div>
      <button
        type="button"
        class="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
        @click="modalOpen = true"
      >
        Add landlord
      </button>
    </div>

    <EmptyState
      v-if="!rows.length"
      :image-src="emptyTenants"
      title="No landlords yet"
      description="Create the first landlord account to start managing subscriptions and platform usage."
      action-label="Create landlord"
      @action="modalOpen = true"
    />

    <Table v-else :columns="columns" :rows="rows">
      <template #fullName="{ row }">
        <div>
          <p class="font-medium text-slate-950">
            {{ row.fullName }}
          </p>
          <p class="text-xs text-slate-500">
            {{ row.id }}
          </p>
        </div>
      </template>
      <template #plan="{ row }">
        {{ row.subscription?.planType || 'annual' }}
      </template>
      <template #status="{ row }">
        <Badge :kind="row.subscription?.status || 'unpaid'" />
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="markPaid(row)">
            Mark paid
          </button>
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="markUnpaid(row)">
            Mark unpaid
          </button>
          <button
            v-if="row.subscription?.planType === 'annual'"
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1 text-xs"
            @click="renewAnnual(row)"
          >
            Renew annual
          </button>
        </div>
      </template>
    </Table>

    <Modal v-model="modalOpen" title="Create landlord account">
      <div class="grid gap-4 md:grid-cols-2">
        <FormField field-id="landlord-name" label="Full name" :error="errors.fullName">
          <input id="landlord-name" v-model="form.fullName" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="landlord-email" label="Email" :error="errors.email">
          <input id="landlord-email" v-model="form.email" type="email" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="landlord-password" label="Password" :error="errors.password" hint="This is a local demo password only.">
          <input id="landlord-password" v-model="form.password" type="password" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="plan-type" label="Plan type">
          <select id="plan-type" v-model="form.planType" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
            <option value="annual">Annual - 12000 RWF/year</option>
            <option value="lifetime">One-time - 100000 RWF lifetime</option>
          </select>
        </FormField>
      </div>
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm" @click="modalOpen = false">
          Cancel
        </button>
        <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" :disabled="submitting" @click="createLandlord">
          {{ submitting ? 'Creating...' : 'Create landlord' }}
        </button>
      </div>
    </Modal>
  </section>
</template>

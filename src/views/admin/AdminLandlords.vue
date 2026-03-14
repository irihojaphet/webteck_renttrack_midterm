<script setup>
import { computed, reactive, ref } from 'vue'
import Badge from '../../components/Badge.vue'
import EmptyState from '../../components/EmptyState.vue'
import FormField from '../../components/FormField.vue'
import Modal from '../../components/Modal.vue'
import PasswordField from '../../components/PasswordField.vue'
import Table from '../../components/Table.vue'
import { useAuthStore } from '../../stores/auth'
import { useLandlordsStore } from '../../stores/landlords'
import { useSubscriptionsStore } from '../../stores/subscriptions'
import emptyTenants from '../../assets/placeholders/empty-tenants.svg'

const auth = useAuthStore()
const landlordsStore = useLandlordsStore()
const subscriptionsStore = useSubscriptionsStore()

const modalOpen = ref(false)
const editId = ref('')
const submitting = ref(false)
const actionError = ref('')
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  planType: 'annual',
})
const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
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
  editId.value = ''
  form.fullName = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.planType = 'annual'
  errors.fullName = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  actionError.value = ''
}

function validate() {
  const requiresPassword = !editId.value || Boolean(form.password)
  errors.fullName = form.fullName ? '' : 'Enter the landlord name.'
  errors.email = form.email ? '' : 'Enter a landlord email.'
  errors.password = !requiresPassword || form.password.length >= 6 ? '' : 'Use at least 6 characters.'
  errors.confirmPassword = !requiresPassword
    ? ''
    : form.confirmPassword
      ? (form.confirmPassword === form.password ? '' : 'Passwords do not match.')
      : 'Confirm the password.'
  return !errors.fullName && !errors.email && !errors.password && !errors.confirmPassword
}

function openCreate() {
  resetForm()
  modalOpen.value = true
}

function openEdit(row) {
  resetForm()
  editId.value = row.id
  form.fullName = row.fullName
  form.email = row.email
  form.planType = row.subscription?.planType || 'annual'
  modalOpen.value = true
}

async function saveLandlord() {
  if (!validate()) return
  submitting.value = true
  try {
    if (editId.value) {
      landlordsStore.updateLandlord(
        editId.value,
        {
          fullName: form.fullName,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
        },
        auth.role,
        auth.currentUser.id,
      )
    } else {
      landlordsStore.createLandlord({
        ...form,
        actorRole: auth.role,
        actorId: auth.currentUser.id,
      })
    }
    modalOpen.value = false
    resetForm()
  } catch (error) {
    actionError.value = error.message || 'Unable to save landlord.'
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

function removeLandlord(row) {
  actionError.value = ''
  try {
    landlordsStore.removeLandlord(row.id, auth.role, auth.currentUser.id)
  } catch (error) {
    actionError.value = error.message || 'Unable to remove landlord.'
  }
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
        @click="openCreate"
      >
        Add landlord
      </button>
    </div>

    <div v-if="actionError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
      {{ actionError }}
    </div>

    <EmptyState
      v-if="!rows.length"
      :image-src="emptyTenants"
      title="No landlords yet"
      description="Create the first landlord account to start managing subscriptions and platform usage."
      action-label="Create landlord"
      @action="openCreate"
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
          <button type="button" class="rounded-full border border-slate-200 px-3 py-1 text-xs" @click="openEdit(row)">
            Edit
          </button>
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
          <button type="button" class="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-700" @click="removeLandlord(row)">
            Delete
          </button>
        </div>
      </template>
    </Table>

    <Modal v-model="modalOpen" :title="editId ? 'Edit landlord account' : 'Create landlord account'">
      <div v-if="actionError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
        {{ actionError }}
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <FormField field-id="landlord-name" label="Full name" :error="errors.fullName">
          <input id="landlord-name" v-model="form.fullName" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <FormField field-id="landlord-email" label="Email" :error="errors.email">
          <input id="landlord-email" v-model="form.email" type="email" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
        </FormField>
        <PasswordField
          v-model="form.password"
          field-id="landlord-password"
          label="Password"
          :error="errors.password"
          :hint="editId ? 'Leave blank to keep the current password.' : 'This is a local demo password only.'"
          :autocomplete="editId ? 'new-password' : 'new-password'"
        />
        <PasswordField
          v-model="form.confirmPassword"
          field-id="landlord-confirm-password"
          label="Confirm password"
          :error="errors.confirmPassword"
          :hint="editId ? 'Only required when you enter a new password.' : ''"
          autocomplete="new-password"
        />
        <FormField field-id="plan-type" label="Plan type">
          <select id="plan-type" v-model="form.planType" :disabled="editId" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm disabled:bg-slate-100">
            <option value="annual">Annual - 12000 RWF/year</option>
            <option value="lifetime">One-time - 100000 RWF lifetime</option>
          </select>
        </FormField>
      </div>
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm" @click="modalOpen = false">
          Cancel
        </button>
        <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" :disabled="submitting" @click="saveLandlord">
          {{ submitting ? (editId ? 'Saving...' : 'Creating...') : (editId ? 'Save landlord' : 'Create landlord') }}
        </button>
      </div>
    </Modal>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import Badge from '../../components/Badge.vue'
import Modal from '../../components/Modal.vue'
import Table from '../../components/Table.vue'
import { useAuthStore } from '../../stores/auth'
import { usePaymentProofsStore } from '../../stores/paymentProofs'
import { useTenantsStore } from '../../stores/tenants'

const auth = useAuthStore()
const paymentProofsStore = usePaymentProofsStore()
const tenantsStore = useTenantsStore()

const rejectTarget = ref(null)
const rejection = reactive({
  reason: '',
})
const rejectOpen = computed({
  get: () => Boolean(rejectTarget.value),
  set: (value) => {
    if (!value) {
      rejectTarget.value = null
    }
  },
})

const rows = computed(() =>
  paymentProofsStore.items
    .filter((proof) => proof.landlordId === auth.currentUser.id)
    .map((proof) => ({
      ...proof,
      tenant: tenantsStore.items.find((tenant) => tenant.id === proof.tenantId),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const columns = [
  { key: 'tenant', label: 'Tenant' },
  { key: 'month', label: 'Month' },
  { key: 'claimedAmount', label: 'Claimed amount' },
  { key: 'status', label: 'Status' },
  { key: 'proof', label: 'Proof' },
  { key: 'actions', label: 'Actions' },
]

function confirmProof(id) {
  paymentProofsStore.reviewProof(
    id,
    {
      status: 'Confirmed',
      landlordComment: 'Confirmed after document review.',
    },
    { role: auth.role, id: auth.currentUser.id },
  )
}

function rejectProof() {
  paymentProofsStore.reviewProof(
    rejectTarget.value,
    {
      status: 'Rejected',
      landlordComment: rejection.reason,
    },
    { role: auth.role, id: auth.currentUser.id },
  )
  rejection.reason = ''
  rejectTarget.value = null
}
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-3xl font-semibold text-slate-950">
        Payment proof review
      </h1>
    </div>

    <Table :columns="columns" :rows="rows">
      <template #tenant="{ row }">
        {{ row.tenant?.fullName }}
      </template>
      <template #claimedAmount="{ row }">
        {{ Number(row.claimedAmount).toLocaleString() }} RWF
      </template>
      <template #status="{ row }">
        <Badge :kind="row.status" />
      </template>
      <template #proof="{ row }">
        <img :src="row.proofImage" alt="" class="h-20 w-28 rounded-2xl border border-slate-200 object-cover" />
      </template>
      <template #actions="{ row }">
        <div class="flex flex-wrap gap-2">
          <button
            v-if="row.status === 'Pending'"
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1 text-xs"
            @click="confirmProof(row.id)"
          >
            Confirm
          </button>
          <button
            v-if="row.status === 'Pending'"
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1 text-xs"
            @click="rejectTarget = row.id"
          >
            Reject
          </button>
          <p v-if="row.landlordComment" class="text-xs text-slate-500">
            {{ row.landlordComment }}
          </p>
        </div>
      </template>
    </Table>

    <Modal v-model="rejectOpen" title="Reject payment proof">
      <label class="space-y-1.5 text-sm text-slate-700">
        <span class="font-medium">Reason</span>
        <textarea v-model="rejection.reason" rows="4" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"></textarea>
      </label>
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm" @click="rejectTarget = null">
          Cancel
        </button>
        <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" @click="rejectProof">
          Reject proof
        </button>
      </div>
    </Modal>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import Badge from '../../components/Badge.vue'
import EmptyState from '../../components/EmptyState.vue'
import FileUploadWithPreview from '../../components/FileUploadWithPreview.vue'
import FormField from '../../components/FormField.vue'
import Table from '../../components/Table.vue'
import emptyPayments from '../../assets/placeholders/empty-payments.svg'
import { useSessionEntities } from '../../composables/useSessionEntities'
import { usePaymentProofsStore } from '../../stores/paymentProofs'
import { usePaymentsStore } from '../../stores/payments'

const { auth, currentLease, currentTenant } = useSessionEntities()
const paymentProofsStore = usePaymentProofsStore()
const paymentsStore = usePaymentsStore()

const form = reactive({
  month: new Date().toISOString().slice(0, 7),
  claimedAmount: 0,
  proofImage: '',
})
const submitting = ref(false)

const proofRows = computed(() =>
  paymentProofsStore.items
    .filter((proof) => proof.tenantId === currentTenant.value?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)
const paymentRows = computed(() =>
  paymentsStore.items
    .filter((payment) => payment.tenantId === currentTenant.value?.id)
    .sort((a, b) => b.month.localeCompare(a.month)),
)
const columns = [
  { key: 'month', label: 'Month' },
  { key: 'claimedAmount', label: 'Claimed amount' },
  { key: 'status', label: 'Review status' },
  { key: 'proofImage', label: 'Proof' },
]

function submitProof() {
  if (!currentLease.value || !currentTenant.value) return
  submitting.value = true
  paymentProofsStore.submitProof(
    {
      landlordId: currentLease.value.landlordId,
      tenantId: currentTenant.value.id,
      leaseId: currentLease.value.id,
      month: form.month,
      claimedAmount: Number(form.claimedAmount),
      proofImage: form.proofImage,
    },
    { role: auth.role, id: currentTenant.value.id },
  )
  form.month = new Date().toISOString().slice(0, 7)
  form.claimedAmount = 0
  form.proofImage = ''
  submitting.value = false
}
</script>

<template>
  <section class="space-y-6">
    <div class="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 class="text-3xl font-semibold text-slate-950">
          Submit payment proof
        </h1>
        <div v-if="currentLease" class="mt-5 rounded-[24px] bg-slate-50 p-4 text-sm text-slate-600">
          Monthly rent due:
          <span class="font-semibold text-slate-950">{{ Number(currentLease.monthlyRent).toLocaleString() }} RWF</span>
        </div>
        <div class="mt-5 space-y-4">
          <FormField field-id="proof-month" label="Month">
            <input id="proof-month" v-model="form.month" type="month" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </FormField>
          <FormField field-id="proof-amount" label="Claimed amount">
            <input id="proof-amount" v-model.number="form.claimedAmount" type="number" min="0" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm" />
          </FormField>
          <FormField field-id="proof-image" label="Proof image">
            <FileUploadWithPreview v-model="form.proofImage" field-id="proof-image" />
          </FormField>
          <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white" :disabled="submitting" @click="submitProof">
            {{ submitting ? 'Submitting...' : 'Submit proof' }}
          </button>
        </div>
      </section>

      <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-semibold text-slate-950">
          Confirmed payment history
        </h2>
        <EmptyState
          v-if="!paymentRows.length"
          :image-src="emptyPayments"
          title="No confirmed payments yet"
          description="Confirmed or late payment records will appear here once your landlord reviews your proofs."
        />
        <div v-else class="mt-4 space-y-3">
          <article v-for="payment in paymentRows" :key="payment.id" class="rounded-[24px] bg-slate-50 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-medium text-slate-950">{{ payment.month }}</p>
                <p class="text-sm text-slate-600">{{ Number(payment.amountPaid).toLocaleString() }} RWF</p>
              </div>
              <Badge :kind="payment.status" />
            </div>
          </article>
        </div>
      </section>
    </div>

    <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-slate-950">
        Proof submission history
      </h2>
      <EmptyState
        v-if="!proofRows.length"
        :image-src="emptyPayments"
        title="No proofs submitted yet"
        description="Use the form above to upload a payment proof for your current lease."
      />
      <Table v-else :columns="columns" :rows="proofRows">
        <template #claimedAmount="{ row }">
          {{ Number(row.claimedAmount).toLocaleString() }} RWF
        </template>
        <template #status="{ row }">
          <Badge :kind="row.status" />
        </template>
        <template #proofImage="{ row }">
          <img :src="row.proofImage" alt="" class="h-16 w-24 rounded-xl border border-slate-200 object-cover" />
        </template>
      </Table>
    </section>
  </section>
</template>

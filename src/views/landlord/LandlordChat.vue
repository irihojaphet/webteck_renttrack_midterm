<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '../../components/EmptyState.vue'
import emptyTickets from '../../assets/placeholders/empty-tickets.svg'
import { useAuthStore } from '../../stores/auth'
import { useChatsStore } from '../../stores/chats'
import { useTenantsStore } from '../../stores/tenants'

const route = useRoute()
const auth = useAuthStore()
const chatsStore = useChatsStore()
const tenantsStore = useTenantsStore()

const selectedThreadId = ref(typeof route.query.thread === 'string' ? route.query.thread : '')
const draft = ref('')
const generalTenantId = ref('')

const myThreads = computed(() =>
  chatsStore.sortedThreads
    .filter((thread) => thread.landlordId === auth.currentUser.id)
    .map((thread) => ({
      ...thread,
      tenant: tenantsStore.items.find((tenant) => tenant.id === thread.tenantId),
    })),
)
const selectedThread = computed(
  () => myThreads.value.find((thread) => thread.id === selectedThreadId.value) || myThreads.value[0] || null,
)
const threadMessages = computed(() =>
  chatsStore.messages.filter((message) => message.threadId === selectedThread.value?.id),
)
const myTenants = computed(() => tenantsStore.items.filter((tenant) => tenant.landlordId === auth.currentUser.id))

function ensureGeneralThread() {
  if (!generalTenantId.value) return
  const thread = chatsStore.getOrCreateThread({
    landlordId: auth.currentUser.id,
    tenantId: generalTenantId.value,
    contextType: 'general',
    contextId: `general:${auth.currentUser.id}:${generalTenantId.value}`,
    subject: 'General conversation',
  })
  selectedThreadId.value = thread.id
}

function sendMessage() {
  if (!selectedThread.value || !draft.value.trim()) return
  chatsStore.sendMessage({
    threadId: selectedThread.value.id,
    senderRole: auth.role,
    senderId: auth.currentUser.id,
    text: draft.value.trim(),
  })
  draft.value = ''
}
</script>

<template>
  <section class="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
    <aside class="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 class="text-2xl font-semibold text-slate-950">
          Chat threads
        </h1>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Threads are tied to a context: payment proof, maintenance ticket, or a general conversation.
        </p>
      </div>
      <div class="rounded-[24px] bg-slate-50 p-4">
        <label class="space-y-1.5 text-sm text-slate-700">
          <span class="font-medium">Start a general thread</span>
          <select v-model="generalTenantId" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
            <option value="">Choose tenant</option>
            <option v-for="tenant in myTenants" :key="tenant.id" :value="tenant.id">
              {{ tenant.fullName }}
            </option>
          </select>
        </label>
        <button type="button" class="mt-3 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" @click="ensureGeneralThread">
          Create thread
        </button>
      </div>
      <button
        v-for="thread in myThreads"
        :key="thread.id"
        type="button"
        class="block w-full rounded-[24px] border px-4 py-4 text-left"
        :class="selectedThread?.id === thread.id ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white'"
        @click="selectedThreadId = thread.id"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          {{ thread.contextType }}
        </p>
        <p class="mt-2 font-medium text-slate-950">
          {{ thread.subject }}
        </p>
        <p class="mt-1 text-sm text-slate-600">
          {{ thread.tenant?.fullName }}
        </p>
      </button>
    </aside>

    <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <EmptyState
        v-if="!selectedThread"
        :image-src="emptyTickets"
        title="No chat thread selected"
        description="Create a general thread or open a thread from maintenance and payment-proof screens."
      />
      <template v-else>
        <div class="border-b border-slate-200 pb-4">
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            {{ selectedThread.contextType }}
          </p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-950">
            {{ selectedThread.subject }}
          </h2>
        </div>
        <div class="mt-6 space-y-4">
          <article
            v-for="message in threadMessages"
            :key="message.id"
            class="max-w-xl rounded-[24px] px-4 py-3"
            :class="message.senderRole === 'landlord' ? 'ml-auto bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'"
          >
            <p class="text-xs uppercase tracking-[0.18em]" :class="message.senderRole === 'landlord' ? 'text-indigo-100' : 'text-slate-500'">
              {{ message.senderRole }}
            </p>
            <p class="mt-2 text-sm leading-6">
              {{ message.text }}
            </p>
          </article>
        </div>
        <div class="mt-6 flex gap-3">
          <textarea
            v-model="draft"
            rows="3"
            class="block min-h-[88px] flex-1 rounded-[24px] border border-slate-300 px-4 py-3 text-sm"
            placeholder="Write a message"
          ></textarea>
          <button type="button" class="self-end rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white" @click="sendMessage">
            Send
          </button>
        </div>
      </template>
    </section>
  </section>
</template>

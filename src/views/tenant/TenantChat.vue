<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import EmptyState from '../../components/EmptyState.vue'
import emptyTickets from '../../assets/placeholders/empty-tickets.svg'
import { useSessionEntities } from '../../composables/useSessionEntities'
import { useChatsStore } from '../../stores/chats'

const route = useRoute()
const { auth, currentLease, currentTenant } = useSessionEntities()
const chatsStore = useChatsStore()

const selectedThreadId = ref(typeof route.query.thread === 'string' ? route.query.thread : '')
const draft = ref('')

const myThreads = computed(() =>
  chatsStore.sortedThreads.filter((thread) => thread.tenantId === currentTenant.value?.id),
)
const selectedThread = computed(
  () => myThreads.value.find((thread) => thread.id === selectedThreadId.value) || myThreads.value[0] || null,
)
const threadMessages = computed(() =>
  chatsStore.messages.filter((message) => message.threadId === selectedThread.value?.id),
)

function startGeneralThread() {
  if (!currentTenant.value || !currentLease.value) return
  const thread = chatsStore.getOrCreateThread({
    landlordId: currentLease.value.landlordId,
    tenantId: currentTenant.value.id,
    contextType: 'general',
    contextId: `general:${currentLease.value.landlordId}:${currentTenant.value.id}`,
    subject: 'General conversation',
  })
  selectedThreadId.value = thread.id
}

function sendMessage() {
  if (!selectedThread.value || !draft.value.trim()) return
  chatsStore.sendMessage({
    threadId: selectedThread.value.id,
    senderRole: auth.role,
    senderId: currentTenant.value.id,
    text: draft.value.trim(),
  })
  draft.value = ''
}
</script>

<template>
  <section class="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
    <aside class="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-slate-950">
            Chat threads
          </h1>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Discuss general issues, payment proofs, and maintenance tickets with your landlord.
          </p>
        </div>
        <button type="button" class="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white" @click="startGeneralThread">
          New general
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
      </button>
    </aside>

    <section class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <EmptyState
        v-if="!selectedThread"
        :image-src="emptyTickets"
        title="No chat thread selected"
        description="Create or select a chat thread to see the conversation."
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
            :class="message.senderRole === 'tenant' ? 'ml-auto bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'"
          >
            <p class="text-xs uppercase tracking-[0.18em]" :class="message.senderRole === 'tenant' ? 'text-indigo-100' : 'text-slate-500'">
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

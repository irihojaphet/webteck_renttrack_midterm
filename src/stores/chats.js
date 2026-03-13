import { defineStore } from 'pinia'
import { create, getAll } from '../utils/repo'
import { createId } from '../utils/domain'
import { useAuditLogsStore } from './auditLogs'

export const useChatsStore = defineStore('chats', {
  state: () => ({
    threads: getAll('chatThreads'),
    messages: getAll('messages'),
  }),
  getters: {
    sortedThreads(state) {
      return [...state.threads].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
  },
  actions: {
    refresh() {
      this.threads = getAll('chatThreads')
      this.messages = getAll('messages')
    },
    getOrCreateThread(payload) {
      const existing = this.threads.find(
        (thread) => thread.contextType === payload.contextType && thread.contextId === payload.contextId,
      )
      if (existing) return existing
      const thread = create('chatThreads', {
        ...payload,
        subject: payload.subject || 'Conversation',
      })
      this.refresh()
      return thread
    },
    sendMessage({ threadId, senderRole, senderId, text }) {
      const message = create('messages', {
        id: createId('message'),
        threadId,
        senderRole,
        senderId,
        text,
      })
      this.refresh()
      useAuditLogsStore().log({
        actorRole: senderRole,
        actorId: senderId,
        actionType: 'chat_message_sent',
        entityType: 'message',
        entityId: message.id,
        summary: `Sent a chat message in thread ${threadId}.`,
      })
      return message
    },
  },
})

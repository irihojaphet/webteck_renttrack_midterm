import { defineStore } from 'pinia'
import { create, getAll, update } from '../utils/repo'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: getAll('notifications'),
  }),
  getters: {
    sortedItems(state) {
      return [...state.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
    unreadCount(state) {
      return state.items.filter((item) => !item.read).length
    },
  },
  actions: {
    refresh() {
      this.items = getAll('notifications')
    },
    createNotification(notification) {
      const record = create('notifications', {
        ...notification,
        read: false,
      })
      this.refresh()
      return record
    },
    markRead(id) {
      update('notifications', id, { read: true })
      this.refresh()
    },
    markAllReadForUser(userId) {
      this.items
        .filter((item) => item.recipientUserId === userId && !item.read)
        .forEach((item) => update('notifications', item.id, { read: true }))
      this.refresh()
    },
  },
})

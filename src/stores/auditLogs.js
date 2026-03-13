import { defineStore } from 'pinia'
import { create, getAll } from '../utils/repo'

export const useAuditLogsStore = defineStore('auditLogs', {
  state: () => ({
    items: getAll('auditLogs'),
  }),
  getters: {
    sortedItems(state) {
      return [...state.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
  },
  actions: {
    refresh() {
      this.items = getAll('auditLogs')
    },
    log(entry) {
      const record = create('auditLogs', entry)
      this.refresh()
      return record
    },
  },
})

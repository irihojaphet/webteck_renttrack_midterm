import { defineStore } from 'pinia'
import { createId } from '../utils/domain'

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
  }),
  actions: {
    toast({ title, message = '', kind = 'success' }) {
      const id = createId('toast')
      this.toasts.unshift({ id, title, message, kind })
      window.setTimeout(() => {
        this.dismissToast(id)
      }, 5000)
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})

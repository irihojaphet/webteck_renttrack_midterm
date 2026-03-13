import { defineStore } from 'pinia'
import { seedOnce } from '../mock/seed'
import { getAll } from '../utils/repo'
import { getValue, removeValue, setValue } from '../utils/storage'
import { normalizeEmail } from '../utils/domain'

const SESSION_KEY = 'session'

export const useAuthStore = defineStore('auth', {
  state: () => {
    seedOnce()
    return {
      currentUser: getValue(SESSION_KEY, null)?.user || null,
    }
  },
  getters: {
    isAuthenticated(state) {
      return Boolean(state.currentUser)
    },
    role(state) {
      return state.currentUser?.role || null
    },
  },
  actions: {
    refreshSession() {
      this.currentUser = getValue(SESSION_KEY, null)?.user || null
    },
    login(email, password) {
      const users = getAll('users')
      const found = users.find(
        (user) => normalizeEmail(user.email) === normalizeEmail(email) && user.password === password,
      )

      if (!found) {
        throw new Error('Invalid email or password.')
      }

      this.currentUser = {
        id: found.id,
        email: found.email,
        fullName: found.fullName,
        role: found.role,
        landlordId: found.landlordId || null,
      }

      setValue(SESSION_KEY, { user: this.currentUser })
    },
    logout() {
      this.currentUser = null
      removeValue(SESSION_KEY)
    },
  },
})

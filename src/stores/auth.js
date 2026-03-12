import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getValue, setValue } from '../utils/storage'
import { runInitialSeed } from '../utils/seed'

const SESSION_KEY = 'session'

export const useAuthStore = defineStore('auth', () => {
  runInitialSeed()

  const stored = getValue(SESSION_KEY, null)
  const currentUser = ref(stored ? stored.user : null)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const role = computed(() => (currentUser.value ? currentUser.value.role : null))

  function persist() {
    if (currentUser.value) {
      setValue(SESSION_KEY, { user: currentUser.value })
    } else {
      setValue(SESSION_KEY, null)
    }
  }

  function login(email, password) {
    const users = getValue('users', [])
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      throw new Error('Email or password is incorrect. Please try again.')
    }

    currentUser.value = {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      role: found.role,
    }
    persist()
  }

  function register(fullName, email, password) {
    const users = getValue('users', [])
    const normalisedEmail = email.trim().toLowerCase()
    const existing = users.find((u) => u.email.toLowerCase() === normalisedEmail)
    if (existing) {
      throw new Error('An account with this email already exists.')
    }

    const newUser = {
      id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      email: normalisedEmail,
      password,
      role: 'tenant',
      fullName: fullName.trim(),
    }

    const nextUsers = [...users, newUser]
    setValue('users', nextUsers)

    currentUser.value = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    }
    persist()
  }

  function logout() {
    currentUser.value = null
    persist()
  }

  return {
    currentUser,
    isAuthenticated,
    role,
    login,
    register,
    logout,
  }
})


import { defineStore } from 'pinia'
import { create, getAll, remove, update } from '../utils/repo'
import { normalizeEmail } from '../utils/domain'
import { useSubscriptionsStore } from './subscriptions'
import { useAuditLogsStore } from './auditLogs'
import { useUiStore } from './ui'

export const useLandlordsStore = defineStore('landlords', {
  state: () => ({
    users: getAll('users'),
  }),
  getters: {
    items(state) {
      return state.users.filter((user) => user.role === 'landlord')
    },
  },
  actions: {
    refresh() {
      this.users = getAll('users')
    },
    createLandlord({ fullName, email, password, planType, actorRole, actorId }) {
      const normalized = normalizeEmail(email)
      if (this.users.some((user) => normalizeEmail(user.email) === normalized)) {
        throw new Error('A user with this email already exists.')
      }

      const landlord = create('users', {
        fullName,
        email: normalized,
        password,
        role: 'landlord',
      })

      this.refresh()

      const subscriptionsStore = useSubscriptionsStore()
      subscriptionsStore.setSubscriptionState({
        landlordId: landlord.id,
        planType,
        status: 'unpaid',
        actorRole,
        actorId,
        summary: `Created landlord account for ${fullName} with ${planType} subscription pending payment.`,
      })

      useAuditLogsStore().log({
        actorRole,
        actorId,
        actionType: 'landlord_created',
        entityType: 'user',
        entityId: landlord.id,
        summary: `Created landlord account for ${fullName}.`,
      })

      useUiStore().toast({
        title: 'Landlord created',
        message: `${fullName} can now sign in after subscription activation.`,
      })

      return landlord
    },
    updateLandlord(id, payload, actorRole, actorId) {
      const normalizedEmail = payload.email ? normalizeEmail(payload.email) : ''
      if (
        normalizedEmail &&
        this.users.some((user) => user.id !== id && normalizeEmail(user.email) === normalizedEmail)
      ) {
        throw new Error('A user with this email already exists.')
      }

      update('users', id, {
        ...payload,
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
      })
      this.refresh()
      useAuditLogsStore().log({
        actorRole,
        actorId,
        actionType: 'landlord_updated',
        entityType: 'user',
        entityId: id,
        summary: `Updated landlord profile for ${payload.fullName || id}.`,
      })
      useUiStore().toast({
        title: 'Landlord updated',
        message: 'The landlord account details were saved.',
      })
    },
    removeLandlord(id, actorRole, actorId) {
      const linkedProperties = getAll('properties').some((property) => property.landlordId === id)
      const linkedTenants = getAll('tenants').some((tenant) => tenant.landlordId === id)
      const linkedLeases = getAll('leases').some((lease) => lease.landlordId === id)

      if (linkedProperties || linkedTenants || linkedLeases) {
        throw new Error('Remove the landlord properties, tenants, and leases before deleting the account.')
      }

      useSubscriptionsStore().removeByLandlord(id)
      remove('users', id)
      this.refresh()
      useAuditLogsStore().log({
        actorRole,
        actorId,
        actionType: 'landlord_removed',
        entityType: 'user',
        entityId: id,
        summary: 'Removed landlord account.',
      })
      useUiStore().toast({
        title: 'Landlord removed',
        message: 'The landlord account and subscription were deleted.',
      })
    },
  },
})

import { defineStore } from 'pinia'
import { create, getAll, remove, update } from '../utils/repo'
import { normalizeEmail } from '../utils/domain'
import { useLeasesStore } from './leases'
import { useAuditLogsStore } from './auditLogs'
import { useUiStore } from './ui'
import { useUnitsStore } from './units'

export const useTenantsStore = defineStore('tenants', {
  state: () => ({
    items: getAll('tenants'),
    users: getAll('users'),
  }),
  getters: {
    byId(state) {
      return new Map(state.items.map((tenant) => [tenant.id, tenant]))
    },
  },
  actions: {
    refresh() {
      this.items = getAll('tenants')
      this.users = getAll('users')
    },
    createTenantWithLease(payload, actor) {
      const normalized = normalizeEmail(payload.email)
      if (this.users.some((user) => normalizeEmail(user.email) === normalized)) {
        throw new Error('A user with this tenant email already exists.')
      }

      const unit = useUnitsStore().items.find((item) => item.id === payload.unitId)
      if (!unit || unit.status !== 'Available') {
        throw new Error('Choose an available unit before creating the tenant.')
      }

      const user = create('users', {
        fullName: payload.fullName,
        email: normalized,
        password: payload.password,
        role: 'tenant',
        landlordId: payload.landlordId,
      })

      const tenant = create('tenants', {
        userId: user.id,
        landlordId: payload.landlordId,
        fullName: payload.fullName,
        email: normalized,
        phone: payload.phone,
        propertyId: payload.propertyId,
        unitId: payload.unitId,
      })

      useLeasesStore().createLease(
        {
          landlordId: payload.landlordId,
          tenantId: tenant.id,
          propertyId: payload.propertyId,
          unitId: payload.unitId,
          monthlyRent: Number(payload.monthlyRent),
          startDate: payload.startDate,
          status: 'active',
        },
        actor,
      )

      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'tenant_created',
        entityType: 'tenant',
        entityId: tenant.id,
        summary: `Added tenant ${tenant.fullName} and assigned a unit.`,
      })
      useUiStore().toast({
        title: 'Tenant added',
        message: `${tenant.fullName} now has an active lease.`,
      })
      return tenant
    },
    updateTenant(id, payload, actor) {
      const tenant = this.items.find((item) => item.id === id)
      if (!tenant) return

      const normalizedEmail = payload.email ? normalizeEmail(payload.email) : tenant.email
      if (
        this.users.some((user) => user.id !== tenant.userId && normalizeEmail(user.email) === normalizedEmail)
      ) {
        throw new Error('A user with this tenant email already exists.')
      }

      update('tenants', id, {
        ...payload,
        email: normalizedEmail,
      })
      update('users', tenant.userId, {
        fullName: payload.fullName || tenant.fullName,
        email: normalizedEmail,
      })
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'tenant_updated',
        entityType: 'tenant',
        entityId: id,
        summary: `Updated tenant ${payload.fullName || id}.`,
      })
      useUiStore().toast({
        title: 'Tenant updated',
        message: 'The tenant profile details were saved.',
      })
    },
    removeTenant(id, actor) {
      const tenant = this.items.find((item) => item.id === id)
      if (!tenant) return

      const relatedLeases = getAll('leases').some((lease) => lease.tenantId === id)
      const relatedPayments = getAll('payments').some((payment) => payment.tenantId === id)
      const relatedProofs = getAll('paymentProofs').some((proof) => proof.tenantId === id)
      const relatedTickets = getAll('tickets').some((ticket) => ticket.tenantId === id)
      const relatedThreads = getAll('chatThreads').some((thread) => thread.tenantId === id)
      const relatedMessages = getAll('messages').some((message) => message.senderId === id)

      if (relatedLeases || relatedPayments || relatedProofs || relatedTickets || relatedThreads || relatedMessages) {
        throw new Error('This tenant already has operational records and cannot be deleted.')
      }

      remove('tenants', id)
      remove('users', tenant.userId)
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'tenant_removed',
        entityType: 'tenant',
        entityId: id,
        summary: `Removed tenant ${tenant.fullName}.`,
      })
      useUiStore().toast({
        title: 'Tenant removed',
        message: `${tenant.fullName} was removed from the roster.`,
      })
    },
  },
})

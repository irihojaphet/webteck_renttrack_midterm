import { defineStore } from 'pinia'
import { create, getAll, update } from '../utils/repo'
import { addYears, getSubscriptionStatus, today } from '../utils/domain'
import { useNotificationsStore } from './notifications'
import { useAuditLogsStore } from './auditLogs'
import { useUiStore } from './ui'

export const useSubscriptionsStore = defineStore('subscriptions', {
  state: () => ({
    items: getAll('subscriptions'),
  }),
  getters: {
    byLandlordId(state) {
      return new Map(
        state.items.map((item) => [item.landlordId, { ...item, status: getSubscriptionStatus(item) }]),
      )
    },
    paidCount() {
      return this.items.filter((item) => getSubscriptionStatus(item) === 'paid').length
    },
    unpaidCount() {
      return this.items.filter((item) => getSubscriptionStatus(item) !== 'paid').length
    },
    revenueSummary() {
      return this.items.reduce(
        (summary, item) => {
          if (item.status !== 'paid') return summary
          if (item.planType === 'annual') summary.annual += 12000
          if (item.planType === 'lifetime') summary.lifetime += 100000
          return summary
        },
        { annual: 0, lifetime: 0 },
      )
    },
  },
  actions: {
    refresh() {
      this.items = getAll('subscriptions')
    },
    getSubscription(landlordId) {
      return this.byLandlordId.get(landlordId) || null
    },
    setSubscriptionState({
      landlordId,
      planType,
      status,
      actorRole,
      actorId,
      summary,
    }) {
      const existing = this.items.find((item) => item.landlordId === landlordId)
      const startDate = today()
      const endDate = planType === 'annual' ? addYears(startDate, 1) : ''
      const lastPaymentDate = status === 'paid' ? startDate : existing?.lastPaymentDate || ''

      if (existing) {
        update('subscriptions', existing.id, {
          planType,
          status,
          startDate,
          endDate,
          lastPaymentDate,
        })
      } else {
        create('subscriptions', {
          landlordId,
          planType,
          status,
          startDate,
          endDate,
          lastPaymentDate,
        })
      }

      this.refresh()

      const notificationsStore = useNotificationsStore()
      const auditStore = useAuditLogsStore()
      const uiStore = useUiStore()

      if (status !== 'paid') {
        notificationsStore.createNotification({
          recipientUserId: landlordId,
          recipientRole: 'landlord',
          type: 'subscription',
          title: 'Subscription payment needed',
          message: 'Your landlord account remains gated until the subscription is marked paid.',
        })
      }

      auditStore.log({
        actorRole,
        actorId,
        actionType: 'subscription_updated',
        entityType: 'subscription',
        entityId: landlordId,
        summary,
      })

      uiStore.toast({
        title: 'Subscription updated',
        message: summary,
      })
    },
    markPaid({ landlordId, planType, actorRole, actorId }) {
      this.setSubscriptionState({
        landlordId,
        planType,
        status: 'paid',
        actorRole,
        actorId,
        summary: `Subscription marked paid on the ${planType} plan.`,
      })
    },
    markUnpaid({ landlordId, planType, actorRole, actorId }) {
      this.setSubscriptionState({
        landlordId,
        planType,
        status: 'unpaid',
        actorRole,
        actorId,
        summary: 'Subscription marked unpaid.',
      })
    },
    renewAnnual({ landlordId, actorRole, actorId }) {
      this.setSubscriptionState({
        landlordId,
        planType: 'annual',
        status: 'paid',
        actorRole,
        actorId,
        summary: 'Annual subscription renewed for one year.',
      })
    },
    requestDemoPayment({ landlordId, actorRole, actorId }) {
      const notificationsStore = useNotificationsStore()
      const auditStore = useAuditLogsStore()
      notificationsStore.createNotification({
        recipientUserId: 'user-admin',
        recipientRole: 'admin',
        type: 'subscription_request',
        title: 'Landlord requested subscription activation',
        message: `Landlord ${landlordId} requested a demo payment activation.`,
      })
      auditStore.log({
        actorRole,
        actorId,
        actionType: 'subscription_payment_requested',
        entityType: 'subscription',
        entityId: landlordId,
        summary: 'Landlord requested subscription activation in demo mode.',
      })
    },
  },
})

import { defineStore } from 'pinia'
import { create, getAll, update } from '../utils/repo'
import { useAuditLogsStore } from './auditLogs'
import { useLeasesStore } from './leases'
import { useNotificationsStore } from './notifications'
import { usePaymentsStore } from './payments'
import { useTenantsStore } from './tenants'
import { useUiStore } from './ui'

export const usePaymentProofsStore = defineStore('paymentProofs', {
  state: () => ({
    items: getAll('paymentProofs'),
  }),
  getters: {
    pendingItems(state) {
      return state.items.filter((item) => item.status === 'Pending')
    },
  },
  actions: {
    refresh() {
      this.items = getAll('paymentProofs')
    },
    submitProof(payload, actor) {
      const proof = create('paymentProofs', {
        ...payload,
        status: 'Pending',
        landlordComment: '',
      })
      this.refresh()

      useNotificationsStore().createNotification({
        recipientUserId: payload.landlordId,
        recipientRole: 'landlord',
        type: 'payment_proof',
        title: 'Payment proof awaiting review',
        message: `A tenant submitted proof for ${payload.month}.`,
      })
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'payment_proof_submitted',
        entityType: 'payment_proof',
        entityId: proof.id,
        summary: `Tenant submitted proof for ${payload.month}.`,
      })
      useUiStore().toast({
        title: 'Proof submitted',
        message: 'Your landlord has been notified.',
      })
      return proof
    },
    reviewProof(id, decision, actor) {
      const proof = this.items.find((item) => item.id === id)
      if (!proof) return
      if (decision.status === 'Rejected' && !decision.landlordComment) {
        throw new Error('A rejection reason is required.')
      }

      update('paymentProofs', id, decision)
      this.refresh()

      const notificationsStore = useNotificationsStore()
      const auditStore = useAuditLogsStore()
      const uiStore = useUiStore()

      if (decision.status === 'Confirmed') {
        const lease = useLeasesStore().items.find((item) => item.id === proof.leaseId)
        const tenant = useTenantsStore().items.find((item) => item.id === proof.tenantId)
        usePaymentsStore().upsertConfirmedPayment({
          lease,
          tenantId: proof.tenantId,
          month: proof.month,
          amountPaid: proof.claimedAmount,
          actor,
        })
        notificationsStore.createNotification({
          recipientUserId: tenant?.userId,
          recipientRole: 'tenant',
          type: 'payment_proof',
          title: 'Payment proof confirmed',
          message: `Your rent proof for ${proof.month} has been confirmed.`,
        })
        auditStore.log({
          actorRole: actor.role,
          actorId: actor.id,
          actionType: 'payment_proof_confirmed',
          entityType: 'payment_proof',
          entityId: proof.id,
          summary: `Confirmed payment proof for ${proof.month}.`,
        })
        uiStore.toast({
          title: 'Proof confirmed',
          message: `Payment for ${proof.month} has been posted.`,
        })
        return
      }

      notificationsStore.createNotification({
        recipientUserId: useTenantsStore().items.find((item) => item.id === proof.tenantId)?.userId,
        recipientRole: 'tenant',
        type: 'payment_proof',
        title: 'Payment proof rejected',
        message: decision.landlordComment,
      })
      auditStore.log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'payment_proof_rejected',
        entityType: 'payment_proof',
        entityId: proof.id,
        summary: `Rejected payment proof for ${proof.month}.`,
      })
      uiStore.toast({
        title: 'Proof rejected',
        message: 'The tenant can review your rejection reason.',
      })
    },
  },
})

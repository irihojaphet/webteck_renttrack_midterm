import { defineStore } from 'pinia'
import { create, getAll, update } from '../utils/repo'
import { computePaymentStatus, currentMonth, listMonthsBetween, monthIsPast } from '../utils/domain'
import { useAuditLogsStore } from './auditLogs'
import { useUiStore } from './ui'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    items: getAll('payments'),
  }),
  getters: {
    totalCollected(state) {
      return state.items.reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0)
    },
  },
  actions: {
    refresh() {
      this.items = getAll('payments')
    },
    upsertConfirmedPayment({ lease, tenantId, month, amountPaid, actor }) {
      const existing = this.items.find((payment) => payment.leaseId === lease.id && payment.month === month)
      const status = computePaymentStatus(amountPaid, lease.monthlyRent, false)

      if (existing) {
        update('payments', existing.id, {
          amountPaid,
          status,
        })
      } else {
        create('payments', {
          leaseId: lease.id,
          tenantId,
          month,
          amountPaid,
          status,
        })
      }

      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'payment_confirmed',
        entityType: 'payment',
        entityId: `${lease.id}:${month}`,
        summary: `Confirmed payment for ${month} with status ${status}.`,
      })
      useUiStore().toast({
        title: 'Payment saved',
        message: `Payment status is ${status}.`,
      })
    },
    markLate(lease, month, actor) {
      const existing = this.items.find((payment) => payment.leaseId === lease.id && payment.month === month)
      if (existing) {
        update('payments', existing.id, {
          amountPaid: 0,
          status: 'Late',
        })
      } else {
        create('payments', {
          leaseId: lease.id,
          tenantId: lease.tenantId,
          month,
          amountPaid: 0,
          status: 'Late',
        })
      }
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'payment_marked_late',
        entityType: 'payment',
        entityId: `${lease.id}:${month}`,
        summary: `Marked payment for ${month} as late.`,
      })
    },
    syncLatePayments(leases) {
      leases.forEach((lease) => {
        listMonthsBetween(lease.startDate, currentMonth())
          .filter((month) => monthIsPast(month))
          .forEach((month) => {
            const existing = this.items.find((payment) => payment.leaseId === lease.id && payment.month === month)
            if (!existing) {
              create('payments', {
                leaseId: lease.id,
                tenantId: lease.tenantId,
                month,
                amountPaid: 0,
                status: 'Late',
              })
            }
          })
      })
      this.refresh()
    },
  },
})

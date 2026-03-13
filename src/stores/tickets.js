import { defineStore } from 'pinia'
import { create, getAll, update } from '../utils/repo'
import { useAuditLogsStore } from './auditLogs'
import { useNotificationsStore } from './notifications'
import { useUiStore } from './ui'

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    items: getAll('tickets'),
  }),
  getters: {
    openItems(state) {
      return state.items.filter((ticket) => ticket.status !== 'Resolved')
    },
  },
  actions: {
    refresh() {
      this.items = getAll('tickets')
    },
    createTicket(payload, actor) {
      const ticket = create('tickets', {
        ...payload,
        status: 'Open',
        reopenCount: 0,
      })
      this.refresh()
      useNotificationsStore().createNotification({
        recipientUserId: payload.landlordId,
        recipientRole: 'landlord',
        type: 'maintenance_ticket',
        title: 'New maintenance ticket',
        message: `${payload.title} was submitted and requires review.`,
      })
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'ticket_created',
        entityType: 'ticket',
        entityId: ticket.id,
        summary: `Created maintenance ticket: ${payload.title}.`,
      })
      useUiStore().toast({
        title: 'Ticket created',
        message: 'Your landlord has been notified.',
      })
      return ticket
    },
    updateStatus(id, status, actor) {
      update('tickets', id, { status })
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'ticket_status_updated',
        entityType: 'ticket',
        entityId: id,
        summary: `Updated ticket status to ${status}.`,
      })
      useUiStore().toast({
        title: 'Ticket updated',
        message: `Status changed to ${status}.`,
      })
    },
    reopen(id, actor) {
      const ticket = this.items.find((item) => item.id === id)
      if (!ticket || ticket.reopenCount >= 1) {
        throw new Error('This ticket cannot be reopened again.')
      }
      update('tickets', id, {
        status: 'Open',
        reopenCount: ticket.reopenCount + 1,
      })
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'ticket_reopened',
        entityType: 'ticket',
        entityId: id,
        summary: 'Tenant reopened the maintenance ticket.',
      })
    },
  },
})

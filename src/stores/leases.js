import { defineStore } from 'pinia'
import { create, getAll, update } from '../utils/repo'
import { useAuditLogsStore } from './auditLogs'
import { useUnitsStore } from './units'
import { useUiStore } from './ui'

export const useLeasesStore = defineStore('leases', {
  state: () => ({
    items: getAll('leases'),
  }),
  getters: {
    activeItems(state) {
      return state.items.filter((lease) => lease.status === 'active')
    },
  },
  actions: {
    refresh() {
      this.items = getAll('leases')
    },
    createLease(payload, actor) {
      if (this.items.some((lease) => lease.unitId === payload.unitId && lease.status === 'active')) {
        throw new Error('This unit already has an active lease.')
      }

      const lease = create('leases', payload)
      useUnitsStore().setUnitStatus(payload.unitId, 'Occupied')
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'lease_created',
        entityType: 'lease',
        entityId: lease.id,
        summary: `Created lease starting ${payload.startDate}.`,
      })
      useUiStore().toast({
        title: 'Lease created',
        message: 'The assigned unit is now marked occupied.',
      })
      return lease
    },
    endLease(id, actor) {
      const lease = this.items.find((item) => item.id === id)
      if (!lease) return
      update('leases', id, {
        status: 'ended',
        endedAt: new Date().toISOString(),
      })
      useUnitsStore().setUnitStatus(lease.unitId, 'Available')
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'lease_ended',
        entityType: 'lease',
        entityId: id,
        summary: 'Ended lease and released unit occupancy.',
      })
      useUiStore().toast({
        title: 'Lease ended',
        message: 'The unit is available again.',
      })
    },
  },
})

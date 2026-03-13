import { defineStore } from 'pinia'
import { create, getAll, remove, update } from '../utils/repo'
import { coerceUnitsCount, createPrefixCode } from '../utils/domain'
import { useUnitsStore } from './units'
import { useAuditLogsStore } from './auditLogs'
import { useUiStore } from './ui'

export const usePropertiesStore = defineStore('properties', {
  state: () => ({
    items: getAll('properties'),
  }),
  getters: {
    byId(state) {
      return new Map(state.items.map((property) => [property.id, property]))
    },
  },
  actions: {
    refresh() {
      this.items = getAll('properties')
    },
    createProperty(payload, actor) {
      const unitsCount = coerceUnitsCount(payload.category, payload.unitsCount)
      const property = create('properties', {
        ...payload,
        unitsCount,
        prefixCode: createPrefixCode(payload.name),
      })
      useUnitsStore().regenerate(property, unitsCount)
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'property_created',
        entityType: 'property',
        entityId: property.id,
        summary: `Created property ${property.name} with ${unitsCount} unit(s).`,
      })
      useUiStore().toast({
        title: 'Property created',
        message: `${property.name} is ready with generated units.`,
      })
      return property
    },
    updateProperty(id, payload, actor) {
      const existing = this.items.find((item) => item.id === id)
      const unitsCount = coerceUnitsCount(payload.category || existing.category, payload.unitsCount ?? existing.unitsCount)
      update('properties', id, {
        ...payload,
        unitsCount,
      })
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'property_updated',
        entityType: 'property',
        entityId: id,
        summary: `Updated property ${payload.name || existing.name}.`,
      })
      return this.items.find((item) => item.id === id)
    },
    regenerateUnits(id, actor) {
      const property = this.items.find((item) => item.id === id)
      useUnitsStore().regenerate(property, property.unitsCount)
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'units_regenerated',
        entityType: 'property',
        entityId: id,
        summary: `Regenerated units for ${property.name}. Prefix ${property.prefixCode} remained stable.`,
      })
      useUiStore().toast({
        title: 'Units regenerated',
        message: `${property.name} now has a refreshed unit list.`,
      })
    },
    removeProperty(id, actor) {
      useUnitsStore().removeByProperty(id)
      remove('properties', id)
      this.refresh()
      useAuditLogsStore().log({
        actorRole: actor.role,
        actorId: actor.id,
        actionType: 'property_removed',
        entityType: 'property',
        entityId: id,
        summary: 'Removed property and related units.',
      })
    },
  },
})

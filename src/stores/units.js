import { defineStore } from 'pinia'
import { create, getAll, remove, update } from '../utils/repo'
import { createPrefixCode, generateUnits } from '../utils/domain'

export const useUnitsStore = defineStore('units', {
  state: () => ({
    items: getAll('units'),
  }),
  getters: {
    byPropertyId(state) {
      return new Map(
        state.items.reduce((groups, unit) => {
          if (!groups.some(([propertyId]) => propertyId === unit.propertyId)) {
            groups.push([unit.propertyId, []])
          }
          groups.find(([propertyId]) => propertyId === unit.propertyId)[1].push(unit)
          return groups
        }, []),
      )
    },
  },
  actions: {
    refresh() {
      this.items = getAll('units')
    },
    setUnitStatus(id, status) {
      update('units', id, { status })
      this.refresh()
    },
    removeByProperty(propertyId) {
      this.items
        .filter((unit) => unit.propertyId === propertyId)
        .forEach((unit) => remove('units', unit.id))
      this.refresh()
    },
    regenerate(property, unitsCount) {
      const occupied = this.items.some((unit) => unit.propertyId === property.id && unit.status === 'Occupied')
      if (occupied) {
        throw new Error('Occupied units cannot be regenerated. End the active leases first.')
      }

      this.removeByProperty(property.id)
      const generated = generateUnits(property.id, property.prefixCode || createPrefixCode(property.name), unitsCount)
      generated.forEach((unit) => create('units', unit))
      this.refresh()
    },
  },
})

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getAll, create, update, remove } from '../utils/repo'

const ENTITY = 'tickets'

export const useTicketsStore = defineStore(ENTITY, () => {
  const items = ref([...getAll(ENTITY)])

  const openCount = computed(() => items.value.filter((t) => t.status === 'Open').length)

  function refresh() {
    items.value = [...getAll(ENTITY)]
  }

  function add(ticket) {
    const created = create(ENTITY, ticket)
    items.value.push(created)
    return created
  }

  function edit(id, partial) {
    const updated = update(ENTITY, id, partial)
    refresh()
    return updated
  }

  function removeById(id) {
    remove(ENTITY, id)
    refresh()
  }

  const byTenantId = computed(() => {
    const map = new Map()
    items.value.forEach((t) => {
      const list = map.get(t.tenantId) || []
      list.push(t)
      map.set(t.tenantId, list)
    })
    return map
  })

  return {
    items,
    openCount,
    byTenantId,
    refresh,
    add,
    edit,
    removeById,
  }
})


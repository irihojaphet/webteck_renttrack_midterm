import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getAll, create, update, remove } from '../utils/repo'

const ENTITY = 'properties'

export const usePropertiesStore = defineStore(ENTITY, () => {
  const items = ref([...getAll(ENTITY)])

  const count = computed(() => items.value.length)

  function refresh() {
    items.value = [...getAll(ENTITY)]
  }

  function add(property) {
    const created = create(ENTITY, property)
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

  const byId = computed(() => {
    const map = new Map()
    items.value.forEach((p) => map.set(p.id, p))
    return map
  })

  return {
    items,
    count,
    byId,
    refresh,
    add,
    edit,
    removeById,
  }
})


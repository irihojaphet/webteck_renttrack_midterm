import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getAll, create, update, remove } from '../utils/repo'

const ENTITY = 'leases'

export const useLeasesStore = defineStore(ENTITY, () => {
  const items = ref([...getAll(ENTITY)])

  const count = computed(() => items.value.length)
  const activeCount = computed(() => items.value.filter((l) => l.status === 'active').length)

  function refresh() {
    items.value = [...getAll(ENTITY)]
  }

  function add(lease) {
    const created = create(ENTITY, lease)
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
    items.value.forEach((l) => map.set(l.id, l))
    return map
  })

  return {
    items,
    count,
    activeCount,
    byId,
    refresh,
    add,
    edit,
    removeById,
  }
})


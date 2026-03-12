import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getAll, create, update, remove } from '../utils/repo'

const ENTITY = 'payments'

export const usePaymentsStore = defineStore(ENTITY, () => {
  const items = ref([...getAll(ENTITY)])

  const count = computed(() => items.value.length)

  function refresh() {
    items.value = [...getAll(ENTITY)]
  }

  function add(payment) {
    const created = create(ENTITY, payment)
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
    items.value.forEach((p) => {
      const list = map.get(p.tenantId) || []
      list.push(p)
      map.set(p.tenantId, list)
    })
    return map
  })

  const totalsByMonth = computed(() => {
    const totals = {}
    items.value.forEach((p) => {
      if (!totals[p.month]) totals[p.month] = 0
      totals[p.month] += Number(p.amountPaid || 0)
    })
    return totals
  })

  return {
    items,
    count,
    byTenantId,
    totalsByMonth,
    refresh,
    add,
    edit,
    removeById,
  }
})


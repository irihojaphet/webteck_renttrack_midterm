import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getAll, create, update, remove } from '../utils/repo'

const ENTITY = 'expenses'

export const useExpensesStore = defineStore(ENTITY, () => {
  const items = ref([...getAll(ENTITY)])

  const count = computed(() => items.value.length)

  const totalAmount = computed(() =>
    items.value.reduce((sum, e) => sum + Number(e.amount || 0), 0),
  )

  function refresh() {
    items.value = [...getAll(ENTITY)]
  }

  function add(expense) {
    const created = create(ENTITY, expense)
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

  return {
    items,
    count,
    totalAmount,
    refresh,
    add,
    edit,
    removeById,
  }
})


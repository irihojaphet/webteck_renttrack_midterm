import { getEntity, setEntity } from './storage'
import { createId } from './domain'

export function getAll(entity) {
  return getEntity(entity)
}

export function getById(entity, id) {
  return getEntity(entity).find((item) => item.id === id) || null
}

export function create(entity, data) {
  const existing = getEntity(entity)
  const now = new Date().toISOString()
  const record = {
    ...data,
    id: data.id || createId(entity),
    createdAt: data.createdAt || now,
  }
  setEntity(entity, [...existing, record])
  return record
}

export function update(entity, id, partial) {
  const existing = getEntity(entity)
  const updated = existing.map((item) => (item.id === id ? { ...item, ...partial } : item))
  setEntity(entity, updated)
  return updated.find((item) => item.id === id) || null
}

export function remove(entity, id) {
  const existing = getEntity(entity)
  const filtered = existing.filter((item) => item.id !== id)
  setEntity(entity, filtered)
}

export function replaceAll(entity, items) {
  setEntity(entity, items)
  return items
}

export function upsert(entity, predicate, data) {
  const items = getEntity(entity)
  const index = items.findIndex(predicate)

  if (index === -1) {
    return create(entity, data)
  }

  const next = [...items]
  next[index] = { ...next[index], ...data }
  setEntity(entity, next)
  return next[index]
}

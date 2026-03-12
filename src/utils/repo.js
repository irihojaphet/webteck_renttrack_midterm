import { getEntity, setEntity } from './storage'

function generateId(prefix) {
  const random = Math.random().toString(36).slice(2, 8)
  const stamp = Date.now().toString(36)
  return `${prefix}-${stamp}-${random}`
}

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
    id: data.id || generateId(entity),
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


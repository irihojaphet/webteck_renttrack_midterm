const ROOT_KEY = 'renttrack_midterm'

export function readRoot() {
  try {
    const raw = window.localStorage.getItem(ROOT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
    return {}
  } catch {
    return {}
  }
}

export function writeRoot(root) {
  window.localStorage.setItem(ROOT_KEY, JSON.stringify(root))
}

export function getEntity(entity) {
  const root = readRoot()
  const value = root[entity]
  return Array.isArray(value) ? value : []
}

export function setEntity(entity, value) {
  const root = readRoot()
  root[entity] = value
  writeRoot(root)
}

export function getValue(key, defaultValue = null) {
  const root = readRoot()
  if (Object.prototype.hasOwnProperty.call(root, key)) {
    return root[key]
  }
  return defaultValue
}

export function setValue(key, value) {
  const root = readRoot()
  root[key] = value
  writeRoot(root)
}

export function removeValue(key) {
  const root = readRoot()
  delete root[key]
  writeRoot(root)
}

export function resetStorage(root = {}) {
  writeRoot(root)
}

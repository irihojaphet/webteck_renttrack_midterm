export const STORAGE_VERSION = 'renttrack-2026-03-14-v2'

export function createId(prefix) {
  const random = Math.random().toString(36).slice(2, 8)
  const stamp = Date.now().toString(36)
  return `${prefix}-${stamp}-${random}`
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function monthFromDate(date) {
  return String(date || '').slice(0, 7)
}

export function addYears(dateString, years) {
  const date = new Date(dateString)
  date.setFullYear(date.getFullYear() + years)
  return date.toISOString().slice(0, 10)
}

export function formatCurrency(amount) {
  return `${Number(amount || 0).toLocaleString()} RWF`
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function createPrefixCode(name) {
  const letters = String(name || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)

  return letters.padEnd(3, 'X')
}

export function generateUnitCode(prefixCode, index) {
  return `${prefixCode}-${String(index + 1).padStart(3, '0')}`
}

export function generateUnits(propertyId, prefixCode, unitsCount) {
  return Array.from({ length: Number(unitsCount) || 0 }, (_, index) => ({
    id: createId('unit'),
    propertyId,
    code: generateUnitCode(prefixCode, index),
    status: 'Available',
    createdAt: new Date().toISOString(),
  }))
}

export function coerceUnitsCount(category, unitsCount) {
  return category === 'family_house' ? 1 : Math.max(1, Number(unitsCount) || 1)
}

export function getSubscriptionStatus(subscription) {
  if (!subscription) return 'unpaid'
  if (subscription.planType === 'annual' && subscription.endDate && subscription.endDate < today()) {
    return 'expired'
  }
  return subscription.status
}

export function computePaymentStatus(amountPaid, monthlyRent, isLate = false) {
  const amount = Number(amountPaid || 0)
  const rent = Number(monthlyRent || 0)

  if (isLate && amount === 0) return 'Late'
  if (amount >= rent) return 'Paid'
  if (amount > 0 && amount < rent) return 'Partial'
  return 'Late'
}

export function listMonthsBetween(startDate, endMonth = currentMonth()) {
  const result = []
  const start = monthFromDate(startDate)
  if (!start) return result

  const [startYear, startMonth] = start.split('-').map(Number)
  const [endYear, endMonthNumber] = endMonth.split('-').map(Number)
  const cursor = new Date(startYear, startMonth - 1, 1)
  const end = new Date(endYear, endMonthNumber - 1, 1)

  while (cursor <= end) {
    result.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
    )
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return result
}

export function monthIsPast(month) {
  return month < currentMonth()
}

export function initialsFromName(name, fallback = 'RT') {
  if (!name) return fallback
  return name
    .split(' ')
    .filter(Boolean)
    .map((piece) => piece[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

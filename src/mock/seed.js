import {
  STORAGE_VERSION,
  addYears,
  createId,
  createPrefixCode,
  generateUnits,
  today,
} from '../utils/domain'

const ROOT_KEY = 'renttrack_midterm'

function encodeSvg(svg) {
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function sampleProofImage() {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
      <rect width="320" height="200" rx="24" fill="#eef2ff"/>
      <rect x="24" y="24" width="272" height="152" rx="18" fill="#ffffff"/>
      <rect x="48" y="54" width="120" height="12" rx="6" fill="#6366f1"/>
      <rect x="48" y="86" width="220" height="10" rx="5" fill="#cbd5e1"/>
      <rect x="48" y="108" width="176" height="10" rx="5" fill="#cbd5e1"/>
      <circle cx="250" cy="70" r="26" fill="#10b981"/>
      <path d="M239 70l8 8 15-17" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `)
}

function sampleTicketImage() {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
      <rect width="320" height="200" rx="24" fill="#ecfeff"/>
      <rect x="24" y="24" width="272" height="152" rx="18" fill="#ffffff"/>
      <path d="M74 142l32-40 30 24 36-50 52 66" fill="none" stroke="#0f766e" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="90" cy="68" r="16" fill="#14b8a6"/>
    </svg>
  `)
}

function buildSeedRoot() {
  const seededAt = new Date().toISOString()

  const adminUser = {
    id: 'user-admin',
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'System Admin',
    role: 'admin',
    createdAt: seededAt,
  }

  const landlordUser = {
    id: 'user-landlord-1',
    email: 'landlord1@example.com',
    password: 'landlord123',
    fullName: 'Aline Mukamana',
    role: 'landlord',
    createdAt: seededAt,
  }

  const tenantUser = {
    id: 'user-tenant-1',
    email: 'tenant1@example.com',
    password: 'tenant123',
    fullName: 'Kevin Ndayisaba',
    role: 'tenant',
    landlordId: landlordUser.id,
    createdAt: seededAt,
  }

  const subscription = {
    id: 'subscription-landlord-1',
    landlordId: landlordUser.id,
    planType: 'annual',
    status: 'unpaid',
    startDate: today(),
    endDate: addYears(today(), 1),
    lastPaymentDate: '',
    createdAt: seededAt,
  }

  const property = {
    id: 'property-seed-1',
    landlordId: landlordUser.id,
    name: 'Hillview Apartments',
    category: 'apartment',
    location: 'Kimironko, Kigali',
    unitsCount: 6,
    prefixCode: createPrefixCode('Hillview Apartments'),
    createdAt: seededAt,
  }

  const units = generateUnits(property.id, property.prefixCode, property.unitsCount)
  units[0].status = 'Occupied'

  const tenant = {
    id: 'tenant-seed-1',
    userId: tenantUser.id,
    landlordId: landlordUser.id,
    fullName: tenantUser.fullName,
    email: tenantUser.email,
    phone: '+250 788 100 200',
    propertyId: property.id,
    unitId: units[0].id,
    createdAt: seededAt,
  }

  const lease = {
    id: 'lease-seed-1',
    landlordId: landlordUser.id,
    tenantId: tenant.id,
    propertyId: property.id,
    unitId: units[0].id,
    monthlyRent: 250000,
    startDate: '2026-01-01',
    status: 'active',
    createdAt: seededAt,
  }

  const payments = [
    {
      id: 'payment-seed-1',
      leaseId: lease.id,
      tenantId: tenant.id,
      month: '2026-02',
      amountPaid: 250000,
      status: 'Paid',
      createdAt: seededAt,
    },
  ]

  const paymentProof = {
    id: 'proof-seed-1',
    landlordId: landlordUser.id,
    tenantId: tenant.id,
    leaseId: lease.id,
    month: '2026-03',
    claimedAmount: 150000,
    proofImage: sampleProofImage(),
    status: 'Pending',
    landlordComment: '',
    createdAt: seededAt,
  }

  const ticket = {
    id: 'ticket-seed-1',
    landlordId: landlordUser.id,
    tenantId: tenant.id,
    propertyId: property.id,
    unitId: units[0].id,
    title: 'Kitchen sink leakage',
    category: 'Plumbing',
    priority: 'High',
    description: 'Water leaks under the sink cabinet every evening after dishes are washed.',
    proofImages: [sampleTicketImage()],
    status: 'Open',
    reopenCount: 0,
    createdAt: seededAt,
  }

  const thread = {
    id: 'thread-seed-1',
    landlordId: landlordUser.id,
    tenantId: tenant.id,
    contextType: 'general',
    contextId: 'general-landlord-tenant-seed-1',
    subject: 'Welcome to your unit',
    createdAt: seededAt,
  }

  const messages = [
    {
      id: createId('message'),
      threadId: thread.id,
      senderRole: 'landlord',
      senderId: landlordUser.id,
      text: 'Welcome to Hillview Apartments. Use this thread for general questions about your stay.',
      createdAt: seededAt,
    },
    {
      id: createId('message'),
      threadId: thread.id,
      senderRole: 'tenant',
      senderId: tenant.id,
      text: 'Thanks. I have already submitted my March payment proof and a sink repair ticket.',
      createdAt: seededAt,
    },
  ]

  const notifications = [
    {
      id: 'notification-seed-1',
      recipientUserId: landlordUser.id,
      recipientRole: 'landlord',
      type: 'subscription',
      title: 'Subscription payment needed',
      message: 'Your annual plan is currently unpaid. Complete payment to unlock landlord tools.',
      read: false,
      createdAt: seededAt,
    },
    {
      id: 'notification-seed-2',
      recipientUserId: landlordUser.id,
      recipientRole: 'landlord',
      type: 'payment_proof',
      title: 'New payment proof pending review',
      message: 'Kevin Ndayisaba submitted a proof for 2026-03.',
      read: false,
      createdAt: seededAt,
    },
  ]

  const auditLogs = [
    {
      id: 'audit-seed-1',
      actorRole: 'system',
      actorId: 'system',
      actionType: 'seeded_demo_data',
      entityType: 'application',
      entityId: STORAGE_VERSION,
      summary: 'Initialized demo data for admin, landlord, tenant, subscriptions, leases, and communication records.',
      createdAt: seededAt,
    },
  ]

  return {
    __meta: {
      storageVersion: STORAGE_VERSION,
      seededAt,
    },
    session: null,
    users: [adminUser, landlordUser, tenantUser],
    subscriptions: [subscription],
    properties: [property],
    units,
    tenants: [tenant],
    leases: [lease],
    payments,
    paymentProofs: [paymentProof],
    tickets: [ticket],
    chatThreads: [thread],
    messages,
    notifications,
    auditLogs,
  }
}

export function seedOnce() {
  try {
    const raw = window.localStorage.getItem(ROOT_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    const version = parsed?.__meta?.storageVersion

    if (version === STORAGE_VERSION) {
      return
    }
  } catch {
    // Ignore corrupt local data and reseed below.
  }

  window.localStorage.setItem(ROOT_KEY, JSON.stringify(buildSeedRoot()))
}

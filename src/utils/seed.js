import { getValue, setValue } from './storage'

const SEED_FLAG_KEY = 'seeded'

export function runInitialSeed() {
  const alreadySeeded = getValue(SEED_FLAG_KEY, false)
  if (alreadySeeded) return

  const users = [
    {
      id: 'user-landlord',
      email: 'landlord@example.com',
      password: 'landlord123',
      role: 'landlord',
      fullName: 'Demo Landlord',
    },
    {
      id: 'user-tenant',
      email: 'tenant@example.com',
      password: 'tenant123',
      role: 'tenant',
      fullName: 'Demo Tenant',
    },
  ]

  const properties = [
    {
      id: 'prop-1',
      name: 'Sunset Apartments',
      location: 'Downtown Kigali',
      unitsCount: 12,
      createdAt: new Date().toISOString(),
    },
  ]

  const tenants = [
    {
      id: 'tenant-1',
      fullName: 'Demo Tenant',
      phone: '+250 788 000 000',
      email: 'tenant@example.com',
      propertyId: 'prop-1',
      unitLabel: 'A-2',
      createdAt: new Date().toISOString(),
    },
  ]

  const leases = [
    {
      id: 'lease-1',
      tenantId: 'tenant-1',
      propertyId: 'prop-1',
      startDate: new Date().toISOString().slice(0, 10),
      monthlyRent: 500,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ]

  const payments = []
  const tickets = []
  const expenses = []

  setValue('users', users)
  setValue('properties', properties)
  setValue('tenants', tenants)
  setValue('leases', leases)
  setValue('payments', payments)
  setValue('tickets', tickets)
  setValue('expenses', expenses)

  setValue(SEED_FLAG_KEY, true)
}


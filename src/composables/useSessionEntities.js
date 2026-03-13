import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useLeasesStore } from '../stores/leases'
import { usePropertiesStore } from '../stores/properties'
import { useTenantsStore } from '../stores/tenants'
import { useUnitsStore } from '../stores/units'

export function useSessionEntities() {
  const auth = useAuthStore()
  const tenantsStore = useTenantsStore()
  const leasesStore = useLeasesStore()
  const propertiesStore = usePropertiesStore()
  const unitsStore = useUnitsStore()

  const landlordId = computed(() => auth.currentUser?.id || null)
  const currentTenant = computed(
    () => tenantsStore.items.find((tenant) => tenant.userId === auth.currentUser?.id) || null,
  )
  const currentLease = computed(
    () =>
      leasesStore.items.find(
        (lease) => lease.tenantId === currentTenant.value?.id && lease.status === 'active',
      ) || null,
  )
  const currentProperty = computed(
    () => propertiesStore.items.find((property) => property.id === currentLease.value?.propertyId) || null,
  )
  const currentUnit = computed(
    () => unitsStore.items.find((unit) => unit.id === currentLease.value?.unitId) || null,
  )

  return {
    auth,
    landlordId,
    currentTenant,
    currentLease,
    currentProperty,
    currentUnit,
  }
}

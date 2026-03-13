<script setup>
import { computed, ref } from 'vue'
import Badge from '../../components/Badge.vue'
import Table from '../../components/Table.vue'
import { useAuditLogsStore } from '../../stores/auditLogs'

const auditLogsStore = useAuditLogsStore()
const roleFilter = ref('all')
const entityFilter = ref('all')

const rows = computed(() =>
  auditLogsStore.sortedItems.filter((entry) => {
    const byRole = roleFilter.value === 'all' || entry.actorRole === roleFilter.value
    const byEntity = entityFilter.value === 'all' || entry.entityType === entityFilter.value
    return byRole && byEntity
  }),
)

const entityTypes = computed(() => [...new Set(auditLogsStore.items.map((item) => item.entityType))])
const columns = [
  { key: 'createdAt', label: 'Timestamp' },
  { key: 'actorRole', label: 'Actor role' },
  { key: 'actionType', label: 'Action' },
  { key: 'entityType', label: 'Entity type' },
  { key: 'summary', label: 'Summary' },
]
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-3xl font-semibold text-slate-950">
        Audit trail
      </h1>
      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label class="space-y-1.5 text-sm text-slate-700">
          <span class="font-medium">Filter by role</span>
          <select v-model="roleFilter" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="landlord">Landlord</option>
            <option value="tenant">Tenant</option>
            <option value="system">System</option>
          </select>
        </label>
        <label class="space-y-1.5 text-sm text-slate-700">
          <span class="font-medium">Filter by entity</span>
          <select v-model="entityFilter" class="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm">
            <option value="all">All entity types</option>
            <option v-for="entityType in entityTypes" :key="entityType" :value="entityType">
              {{ entityType }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <Table :columns="columns" :rows="rows">
      <template #createdAt="{ row }">
        {{ row.createdAt.slice(0, 16).replace('T', ' ') }}
      </template>
      <template #actorRole="{ row }">
        <Badge :kind="row.actorRole" />
      </template>
      <template #entityType="{ row }">
        <span class="font-medium text-slate-950">{{ row.entityType }}</span>
      </template>
    </Table>
  </section>
</template>

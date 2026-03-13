<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  if (auth.role === 'admin') {
    router.replace('/admin/dashboard')
    return
  }
  if (auth.role === 'landlord') {
    router.replace('/landlord/dashboard')
    return
  }
  if (auth.role === 'tenant') {
    router.replace('/tenant/dashboard')
    return
  }
  router.replace('/login')
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100">
    <p class="text-sm text-slate-600">
      Redirecting to your workspace...
    </p>
  </main>
</template>

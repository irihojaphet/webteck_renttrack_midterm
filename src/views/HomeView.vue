<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  if (auth.isAuthenticated) {
    if (auth.role === 'landlord') {
      router.replace('/landlord/dashboard')
    } else if (auth.role === 'tenant') {
      router.replace('/tenant/dashboard')
    } else {
      router.replace('/login')
    }
  } else {
    router.replace('/login')
  }
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50">
    <p class="text-sm text-slate-600">
      Redirecting to your dashboard…
    </p>
  </main>
</template>


<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppShell from './components/AppShell.vue'

const route = useRoute()
const auth = useAuthStore()

const isAuthRoute = computed(() => route.name === 'login' || route.name === 'signup')
</script>

<template>
  <div>
    <router-view v-if="isAuthRoute" />
    <AppShell v-else-if="auth.isAuthenticated">
      <router-view />
    </AppShell>
    <router-view v-else />
  </div>
</template>


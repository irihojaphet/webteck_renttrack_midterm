<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Badge from '../../components/Badge.vue'
import { useAuthStore } from '../../stores/auth'
import { useSubscriptionsStore } from '../../stores/subscriptions'

const router = useRouter()
const auth = useAuthStore()
const subscriptionsStore = useSubscriptionsStore()
const selectedPlanType = ref('annual')

const subscription = computed(() => subscriptionsStore.getSubscription(auth.currentUser.id))

function requestDemoPayment() {
  subscriptionsStore.requestDemoPayment({
    landlordId: auth.currentUser.id,
    planType: selectedPlanType.value,
    actorRole: auth.role,
    actorId: auth.currentUser.id,
  })
  router.push('/landlord/dashboard')
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-6 py-8">
    <div class="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
            Subscription required
          </p>
          <h1 class="mt-3 text-4xl font-semibold text-slate-950">
            Your landlord workspace is gated until the plan is paid.
          </h1>
        </div>
        <button
          type="button"
          class="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
          @click="logout"
        >
          Log out
        </button>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Current plan
        </p>
        <p class="mt-3 text-3xl font-semibold text-slate-950">
          {{ subscription?.planType === 'lifetime' ? 'Lifetime - 100000 RWF' : 'Annual - 12000 RWF' }}
        </p>
        <div class="mt-3">
          <Badge :kind="subscription?.status || 'unpaid'" />
        </div>
      </article>

      <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Demo action
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-2xl border px-4 py-2.5 text-sm font-medium"
            :class="
              selectedPlanType === 'annual'
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-700'
            "
            @click="selectedPlanType = 'annual'"
          >
            Annual
          </button>
          <button
            type="button"
            class="rounded-2xl border px-4 py-2.5 text-sm font-medium"
            :class="
              selectedPlanType === 'lifetime'
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-700'
            "
            @click="selectedPlanType = 'lifetime'"
          >
            One-time
          </button>
        </div>
        <button type="button" class="mt-5 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white" @click="requestDemoPayment">
          Simulate payment request
        </button>
      </article>
    </div>
  </section>
</template>

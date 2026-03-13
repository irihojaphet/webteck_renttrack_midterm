<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useSubscriptionsStore } from '../../stores/subscriptions'

const auth = useAuthStore()
const subscriptionsStore = useSubscriptionsStore()

const subscription = computed(() => subscriptionsStore.getSubscription(auth.currentUser.id))

function requestDemoPayment() {
  subscriptionsStore.requestDemoPayment({
    landlordId: auth.currentUser.id,
    actorRole: auth.role,
    actorId: auth.currentUser.id,
  })
}
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-6 py-8">
    <div class="rounded-[36px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-indigo-50 p-8 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
        Subscription required
      </p>
      <h1 class="mt-3 text-4xl font-semibold text-slate-950">
        Your landlord workspace is gated until the plan is paid.
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        The admin can mark your plan paid, or you can trigger a demo payment request below. Until then, landlord
        routes stay locked while login and logout remain available.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Current plan
        </p>
        <p class="mt-3 text-3xl font-semibold text-slate-950">
          {{ subscription?.planType === 'lifetime' ? 'Lifetime - 100000 RWF' : 'Annual - 12000 RWF' }}
        </p>
        <p class="mt-3 text-sm text-slate-600">
          Status:
          <span class="font-semibold text-slate-950">{{ subscription?.status }}</span>
        </p>
      </article>

      <article class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Demo action
        </p>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          Trigger a demo payment request. This creates an admin notification and audit log entry so the admin can
          activate your subscription from the dashboard.
        </p>
        <button type="button" class="mt-5 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white" @click="requestDemoPayment">
          Simulate payment request
        </button>
      </article>
    </div>
  </section>
</template>

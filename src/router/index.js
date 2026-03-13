import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useSubscriptionsStore } from '../stores/subscriptions'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import LandlordLayout from '../layouts/LandlordLayout.vue'
import TenantLayout from '../layouts/TenantLayout.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AdminLandlords from '../views/admin/AdminLandlords.vue'
import AdminReports from '../views/admin/AdminReports.vue'
import AdminAudit from '../views/admin/AdminAudit.vue'
import LandlordDashboard from '../views/landlord/LandlordDashboard.vue'
import LandlordProperties from '../views/landlord/LandlordProperties.vue'
import LandlordTenants from '../views/landlord/LandlordTenants.vue'
import LandlordLeases from '../views/landlord/LandlordLeases.vue'
import LandlordPayments from '../views/landlord/LandlordPayments.vue'
import LandlordMaintenance from '../views/landlord/LandlordMaintenance.vue'
import LandlordPaymentProofs from '../views/landlord/LandlordPaymentProofs.vue'
import LandlordChat from '../views/landlord/LandlordChat.vue'
import LandlordSubscriptionRequired from '../views/landlord/LandlordSubscriptionRequired.vue'
import TenantDashboard from '../views/tenant/TenantDashboard.vue'
import TenantPayments from '../views/tenant/TenantPayments.vue'
import TenantMaintenance from '../views/tenant/TenantMaintenance.vue'
import TenantChat from '../views/tenant/TenantChat.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboard,
        },
        {
          path: 'landlords',
          name: 'admin-landlords',
          component: AdminLandlords,
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: AdminReports,
        },
        {
          path: 'audit',
          name: 'admin-audit',
          component: AdminAudit,
        },
      ],
    },
    {
      path: '/landlord',
      component: LandlordLayout,
      meta: { requiresAuth: true, role: 'landlord' },
      children: [
        {
          path: '',
          redirect: '/landlord/dashboard',
        },
        {
          path: 'dashboard',
          name: 'landlord-dashboard',
          component: LandlordDashboard,
        },
        {
          path: 'properties',
          name: 'landlord-properties',
          component: LandlordProperties,
        },
        {
          path: 'tenants',
          name: 'landlord-tenants',
          component: LandlordTenants,
        },
        {
          path: 'leases',
          name: 'landlord-leases',
          component: LandlordLeases,
        },
        {
          path: 'payments',
          name: 'landlord-payments',
          component: LandlordPayments,
        },
        {
          path: 'payment-proofs',
          name: 'landlord-payment-proofs',
          component: LandlordPaymentProofs,
        },
        {
          path: 'maintenance',
          name: 'landlord-maintenance',
          component: LandlordMaintenance,
        },
        {
          path: 'chat',
          name: 'landlord-chat',
          component: LandlordChat,
        },
      ],
    },
    {
      path: '/landlord/subscription-required',
      name: 'landlord-subscription-required',
      component: LandlordSubscriptionRequired,
      meta: { requiresAuth: true, role: 'landlord', bypassSubscriptionGate: true },
    },
    {
      path: '/tenant',
      component: TenantLayout,
      meta: { requiresAuth: true, role: 'tenant' },
      children: [
        {
          path: '',
          redirect: '/tenant/dashboard',
        },
        {
          path: 'dashboard',
          name: 'tenant-dashboard',
          component: TenantDashboard,
        },
        {
          path: 'payments',
          name: 'tenant-payments',
          component: TenantPayments,
        },
        {
          path: 'maintenance',
          name: 'tenant-maintenance',
          component: TenantMaintenance,
        },
        {
          path: 'chat',
          name: 'tenant-chat',
          component: TenantChat,
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const subscriptionsStore = useSubscriptionsStore()

  if (to.meta.public) {
    if (auth.isAuthenticated && (to.path === '/login' || to.name === 'login')) {
      if (auth.role === 'admin') {
        return '/admin/dashboard'
      }
      if (auth.role === 'landlord') {
        return '/landlord/dashboard'
      }
      if (auth.role === 'tenant') {
        return '/tenant/dashboard'
      }
      return '/'
    }
    return true
  }

  if (!auth.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.role && auth.role !== to.meta.role) {
    if (auth.role === 'admin') {
      return '/admin/dashboard'
    }
    if (auth.role === 'landlord') {
      return '/landlord/dashboard'
    }
    if (auth.role === 'tenant') {
      return '/tenant/dashboard'
    }
    return '/'
  }

  if (auth.role === 'landlord') {
    const subscription = subscriptionsStore.getSubscription(auth.currentUser.id)
    const gated = subscription && subscription.status !== 'paid'
    if (gated && to.name !== 'landlord-subscription-required' && !to.meta.bypassSubscriptionGate) {
      return '/landlord/subscription-required'
    }
    if (!gated && to.name === 'landlord-subscription-required') {
      return '/landlord/dashboard'
    }
  }

  return true
})

export default router

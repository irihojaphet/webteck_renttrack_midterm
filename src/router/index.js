import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import LandlordDashboard from '../views/landlord/LandlordDashboard.vue'
import LandlordProperties from '../views/landlord/LandlordProperties.vue'
import LandlordTenants from '../views/landlord/LandlordTenants.vue'
import LandlordLeases from '../views/landlord/LandlordLeases.vue'
import LandlordPayments from '../views/landlord/LandlordPayments.vue'
import LandlordMaintenance from '../views/landlord/LandlordMaintenance.vue'
import LandlordExpenses from '../views/landlord/LandlordExpenses.vue'
import LandlordReports from '../views/landlord/LandlordReports.vue'
import TenantDashboard from '../views/tenant/TenantDashboard.vue'
import TenantPayments from '../views/tenant/TenantPayments.vue'
import TenantMaintenance from '../views/tenant/TenantMaintenance.vue'

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
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/landlord/dashboard',
      name: 'landlord-dashboard',
      component: LandlordDashboard,
      meta: { requiresAuth: true, role: 'landlord' },
    },
    {
      path: '/landlord/properties',
      name: 'landlord-properties',
      component: LandlordProperties,
      meta: { requiresAuth: true, role: 'landlord' },
    },
    {
      path: '/landlord/tenants',
      name: 'landlord-tenants',
      component: LandlordTenants,
      meta: { requiresAuth: true, role: 'landlord' },
    },
    {
      path: '/landlord/leases',
      name: 'landlord-leases',
      component: LandlordLeases,
      meta: { requiresAuth: true, role: 'landlord' },
    },
    {
      path: '/landlord/payments',
      name: 'landlord-payments',
      component: LandlordPayments,
      meta: { requiresAuth: true, role: 'landlord' },
    },
    {
      path: '/landlord/maintenance',
      name: 'landlord-maintenance',
      component: LandlordMaintenance,
      meta: { requiresAuth: true, role: 'landlord' },
    },
    {
      path: '/landlord/expenses',
      name: 'landlord-expenses',
      component: LandlordExpenses,
      meta: { requiresAuth: true, role: 'landlord' },
    },
    {
      path: '/landlord/reports',
      name: 'landlord-reports',
      component: LandlordReports,
      meta: { requiresAuth: true, role: 'landlord' },
    },
    {
      path: '/tenant/dashboard',
      name: 'tenant-dashboard',
      component: TenantDashboard,
      meta: { requiresAuth: true, role: 'tenant' },
    },
    {
      path: '/tenant/payments',
      name: 'tenant-payments',
      component: TenantPayments,
      meta: { requiresAuth: true, role: 'tenant' },
    },
    {
      path: '/tenant/maintenance',
      name: 'tenant-maintenance',
      component: TenantMaintenance,
      meta: { requiresAuth: true, role: 'tenant' },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.isAuthenticated && (to.path === '/login' || to.name === 'login')) {
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
    if (auth.role === 'landlord') {
      return '/landlord/dashboard'
    }
    if (auth.role === 'tenant') {
      return '/tenant/dashboard'
    }
    return '/'
  }

  return true
})

export default router

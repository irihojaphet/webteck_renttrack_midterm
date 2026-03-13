import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { seedOnce } from './mock/seed'
import { useLeasesStore } from './stores/leases'
import { usePaymentsStore } from './stores/payments'

seedOnce()
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const leasesStore = useLeasesStore(pinia)
const paymentsStore = usePaymentsStore(pinia)
paymentsStore.syncLatePayments(leasesStore.activeItems)

app.mount('#app')

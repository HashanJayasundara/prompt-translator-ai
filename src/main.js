/**
 * Application entry point
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@/assets/styles/main.css'
import App from '@/App.vue'
import router from '@/router'
import NotificationService from '@/services/NotificationService'

const app = createApp(App)

/** Pinia state management */
const pinia = createPinia()
app.use(pinia)

/** Vue Router */
app.use(router)

/** Vue Toastification */
const toastOptions = {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  maxToasts: 5,
  newestOnTop: true,
  transition: 'Vue-Toastification__fade'
}
app.use(Toast, toastOptions)

/** Mount the app */
app.mount('#app')

/** Initialize NotificationService with toast instance after mounting */
const toast = useToast()
NotificationService.init(toast)

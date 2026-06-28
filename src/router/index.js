/**
 * Vue Router configuration
 */
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard', icon: 'bi-speedometer2' }
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/UploadView.vue'),
    meta: { title: 'Upload Prompts', icon: 'bi-cloud-upload' }
  },
  {
    path: '/prompts',
    name: 'Prompts',
    component: () => import('@/views/PromptsView.vue'),
    meta: { title: 'Prompt Table', icon: 'bi-table' }
  },
  {
    path: '/translation',
    name: 'Translation',
    component: () => import('@/views/TranslationView.vue'),
    meta: { title: 'Translation', icon: 'bi-translate' }
  },
  {
    path: '/export',
    name: 'Export',
    component: () => import('@/views/ExportView.vue'),
    meta: { title: 'Export', icon: 'bi-download' }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/LogsView.vue'),
    meta: { title: 'Activity Logs', icon: 'bi-journal-text' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Settings', icon: 'bi-gear' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

/** Update page title on navigation */
router.beforeEach((to) => {
  document.title = `${to.meta.title || 'Page'} — Prompt Translator AI`
})

export default router
export { routes }

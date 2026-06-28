<template>
  <aside class="app-sidebar" :class="{ open: isOpen }">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">
        <i class="bi bi-translate"></i>
      </div>
      <div class="sidebar-brand-text">
        <h5>Prompt Translator</h5>
        <small>AI Translation Tool</small>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div class="sidebar-nav-label">Main</div>

      <router-link
        v-for="route in mainRoutes"
        :key="route.name"
        :to="route.path"
        class="sidebar-nav-item"
        :class="{ active: $route.name === route.name }"
        @click="emit('close')"
      >
        <i :class="route.meta.icon"></i>
        <span>{{ route.meta.title }}</span>
      </router-link>

      <div class="sidebar-nav-label">System</div>

      <router-link
        v-for="route in systemRoutes"
        :key="route.name"
        :to="route.path"
        class="sidebar-nav-item"
        :class="{ active: $route.name === route.name }"
        @click="emit('close')"
      >
        <i :class="route.meta.icon"></i>
        <span>{{ route.meta.title }}</span>
      </router-link>
    </nav>

    <!-- Sidebar footer — storage info -->
    <div class="sidebar-footer">
      <div class="d-flex align-items-center gap-2 mb-2">
        <i class="bi bi-hdd text-muted" style="font-size: 0.85rem;"></i>
        <small class="text-muted">Storage: {{ storageSize }}</small>
      </div>
      <div class="progress-custom" style="height: 4px;">
        <div class="progress-bar" :style="{ width: storagePercent + '%' }"></div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { routes } from '@/router'
import StorageService from '@/services/StorageService'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

/** Split routes into main and system groups */
const mainRoutes = computed(() =>
  routes.filter(r => ['Dashboard', 'Upload', 'Prompts', 'Translation', 'Export'].includes(r.name))
)

const systemRoutes = computed(() =>
  routes.filter(r => ['Logs', 'Settings'].includes(r.name))
)

/** Storage info */
const storageSize = computed(() => StorageService.getFormattedStorageSize())
const storagePercent = computed(() => {
  const bytes = StorageService.getStorageSize()
  const maxBytes = 5 * 1024 * 1024 // 5MB localStorage limit
  return Math.min(100, (bytes / maxBytes) * 100)
})
</script>

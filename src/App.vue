<template>
  <div class="app-layout" :data-theme="settingsStore.theme">
    <!-- Mobile sidebar overlay -->
    <div
      class="sidebar-overlay"
      :class="{ show: sidebarOpen }"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <div class="app-main">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { usePromptStore } from '@/stores/promptStore'
import { useLogStore } from '@/stores/logStore'
import Sidebar from '@/components/layout/Sidebar.vue'
import Navbar from '@/components/layout/Navbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const settingsStore = useSettingsStore()
const promptStore = usePromptStore()
const logStore = useLogStore()

const sidebarOpen = ref(false)

/** Load all persisted data on mount */
onMounted(() => {
  settingsStore.loadFromStorage()
  settingsStore.applyTheme()
  promptStore.loadFromStorage()
  logStore.loadFromStorage()
  logStore.addLog('info', 'Application loaded')
})
</script>

<style scoped>
/* Route transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

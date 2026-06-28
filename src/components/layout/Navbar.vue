<template>
  <header class="app-navbar">
    <!-- Left: Menu button + page title -->
    <div class="d-flex align-items-center gap-3">
      <button class="btn-icon d-lg-none" @click="emit('toggleSidebar')">
        <i class="bi bi-list"></i>
      </button>
      <div class="navbar-title">
        <i :class="currentRouteIcon"></i>
        {{ currentRouteTitle }}
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="navbar-actions">
      <!-- Translation status indicator -->
      <div
        v-if="translationStore.isTranslating"
        class="d-flex align-items-center gap-2 me-2"
      >
        <div class="spinner-custom sm"></div>
        <small class="text-muted d-none d-md-inline">Translating...</small>
      </div>

      <!-- API key indicator -->
      <div
        class="btn-icon"
        :class="{ 'border-success': settingsStore.hasApiKey, 'border-danger': !settingsStore.hasApiKey }"
        :title="settingsStore.hasApiKey ? 'API Key configured' : 'API Key not set'"
      >
        <i
          class="bi bi-key"
          :class="{ 'text-success': settingsStore.hasApiKey, 'text-danger': !settingsStore.hasApiKey }"
        ></i>
      </div>

      <!-- Theme toggle -->
      <button class="btn-icon" @click="settingsStore.toggleTheme()" title="Toggle theme">
        <i :class="settingsStore.theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon'"></i>
      </button>

      <!-- Progress badge -->
      <div
        v-if="promptStore.totalPrompts > 0"
        class="d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded-pill"
        style="background: var(--accent-primary-light);"
      >
        <small class="fw-semibold" style="color: var(--accent-primary);">
          {{ promptStore.progressPercentage }}% Complete
        </small>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settingsStore'
import { usePromptStore } from '@/stores/promptStore'
import { useTranslationStore } from '@/stores/translationStore'

const emit = defineEmits(['toggleSidebar'])

const route = useRoute()
const settingsStore = useSettingsStore()
const promptStore = usePromptStore()
const translationStore = useTranslationStore()

const currentRouteTitle = computed(() => route.meta?.title || 'Dashboard')
const currentRouteIcon = computed(() => route.meta?.icon || 'bi-speedometer2')
</script>

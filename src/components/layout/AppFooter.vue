<template>
  <footer class="app-footer">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
      <div>
        <span class="fw-semibold">Prompt Translator AI</span>
        <span class="ms-1">v1.0.0</span>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span v-if="promptStore.totalPrompts > 0">
          <i class="bi bi-file-text me-1"></i>
          {{ promptStore.totalPrompts }} prompts
        </span>
        <span v-if="promptStore.translatedCount > 0">
          <i class="bi bi-check-circle me-1"></i>
          {{ promptStore.translatedCount }} translated
        </span>
        <span>
          <i class="bi bi-hdd me-1"></i>
          {{ storageSize }}
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import StorageService from '@/services/StorageService'

const promptStore = usePromptStore()
const storageSize = computed(() => StorageService.getFormattedStorageSize())
</script>

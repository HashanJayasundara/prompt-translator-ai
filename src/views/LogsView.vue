<template>
  <div class="animate-fade-in-up">
    <!-- Page header -->
    <div class="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
      <div>
        <h2>Activity Logs</h2>
        <p>View application activity and translation history</p>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-secondary-custom btn-sm"
          @click="saveLogs"
        >
          <i class="bi bi-save me-1"></i>Save Logs
        </button>
        <button
          class="btn btn-outline-danger btn-sm"
          @click="showClearConfirm = true"
          :disabled="logStore.logs.length === 0"
        >
          <i class="bi bi-trash me-1"></i>Clear Logs
        </button>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="card-custom mb-3" v-if="logStore.logs.length > 0">
      <div class="card-body py-2">
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <span class="text-muted" style="font-size: 0.8rem;">Filter:</span>
          <button
            class="btn btn-sm"
            :class="filterType === '' ? 'btn-primary-custom' : 'btn-secondary-custom'"
            @click="filterType = ''"
          >
            All ({{ logStore.logs.length }})
          </button>
          <button
            class="btn btn-sm"
            :class="filterType === 'info' ? 'btn-primary-custom' : 'btn-secondary-custom'"
            @click="filterType = 'info'"
          >
            <i class="bi bi-info-circle me-1"></i>Info
          </button>
          <button
            class="btn btn-sm"
            :class="filterType === 'success' ? 'btn-primary-custom' : 'btn-secondary-custom'"
            @click="filterType = 'success'"
          >
            <i class="bi bi-check-circle me-1"></i>Success
          </button>
          <button
            class="btn btn-sm"
            :class="filterType === 'warning' ? 'btn-primary-custom' : 'btn-secondary-custom'"
            @click="filterType = 'warning'"
          >
            <i class="bi bi-exclamation-triangle me-1"></i>Warning
          </button>
          <button
            class="btn btn-sm"
            :class="filterType === 'error' ? 'btn-primary-custom' : 'btn-secondary-custom'"
            @click="filterType = 'error'"
          >
            <i class="bi bi-x-circle me-1"></i>Errors ({{ logStore.errorLogs.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Logs list -->
    <div class="card-custom">
      <div class="card-body p-0">
        <div v-if="filteredLogs.length === 0" class="empty-state">
          <i class="bi bi-journal d-block"></i>
          <h5>No Logs</h5>
          <p>Activity logs will appear here as you use the application</p>
        </div>
        <div v-else style="max-height: 600px; overflow-y: auto; padding: 12px;">
          <div
            v-for="log in filteredLogs"
            :key="log.id"
            class="log-entry animate-fade-in"
            :class="log.type"
          >
            <i :class="logIcon(log.type)" style="margin-top: 2px; flex-shrink: 0;"></i>
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear confirmation -->
    <ConfirmDialog
      :show="showClearConfirm"
      title="Clear All Logs"
      message="Are you sure you want to clear all activity logs?"
      confirm-text="Clear"
      variant="warning"
      @confirm="clearLogs"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLogStore } from '@/stores/logStore'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import NotificationService from '@/services/NotificationService'

const logStore = useLogStore()

const filterType = ref('')
const showClearConfirm = ref(false)

/** Filtered logs (reversed so newest first) */
const filteredLogs = computed(() => {
  const reversed = [...logStore.logs].reverse()
  if (!filterType.value) return reversed
  return reversed.filter(l => l.type === filterType.value)
})

/** Log icon by type */
function logIcon(type) {
  const icons = {
    info: 'bi bi-info-circle',
    success: 'bi bi-check-circle',
    warning: 'bi bi-exclamation-triangle',
    error: 'bi bi-x-circle'
  }
  return icons[type] || 'bi bi-circle'
}

/** Format timestamp */
function formatTime(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/** Save logs to localStorage */
function saveLogs() {
  logStore.saveToStorage()
  NotificationService.success('Logs saved!')
}

/** Clear all logs */
function clearLogs() {
  logStore.clearLogs()
  showClearConfirm.value = false
  NotificationService.info('All logs cleared')
}
</script>

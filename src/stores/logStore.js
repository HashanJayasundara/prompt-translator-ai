/**
 * Log Store — Manages application activity logs
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LOG_TYPES } from '@/config/constants'
import StorageService from '@/services/StorageService'

export const useLogStore = defineStore('logs', () => {
  /** State */
  const logs = ref([])
  const maxLogs = ref(500)

  /** Computed */
  const recentLogs = computed(() => {
    return [...logs.value].reverse().slice(0, 100)
  })

  const errorLogs = computed(() => {
    return logs.value.filter(l => l.type === LOG_TYPES.ERROR)
  })

  const successLogs = computed(() => {
    return logs.value.filter(l => l.type === LOG_TYPES.SUCCESS)
  })

  /** Actions */

  /**
   * Add a log entry
   * @param {string} type - Log type (info, success, warning, error)
   * @param {string} message - Log message
   */
  function addLog(type, message) {
    const entry = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toISOString()
    }

    logs.value.push(entry)

    /** Trim old logs if exceeding max */
    if (logs.value.length > maxLogs.value) {
      logs.value = logs.value.slice(-maxLogs.value)
    }
  }

  /**
   * Clear all logs
   */
  function clearLogs() {
    logs.value = []
    StorageService.saveLogs([])
  }

  /**
   * Load logs from localStorage
   */
  function loadFromStorage() {
    const saved = StorageService.loadLogs()
    if (saved && saved.length > 0) {
      logs.value = saved
    }
  }

  /**
   * Save logs to localStorage
   */
  function saveToStorage() {
    StorageService.saveLogs(logs.value)
  }

  return {
    logs,
    recentLogs,
    errorLogs,
    successLogs,
    addLog,
    clearLogs,
    loadFromStorage,
    saveToStorage
  }
})

/**
 * StorageService — Handles all localStorage operations with JSON serialization
 */
import { STORAGE_KEYS } from '@/config/constants'

class StorageService {
  /**
   * Save a value to localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.error(`[StorageService] Failed to save key "${key}":`, error)
    }
  }

  /**
   * Retrieve a value from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key not found
   * @returns {any} Parsed value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item)
    } catch (error) {
      console.error(`[StorageService] Failed to read key "${key}":`, error)
      return defaultValue
    }
  }

  /**
   * Remove a key from localStorage
   * @param {string} key - Storage key to remove
   */
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`[StorageService] Failed to remove key "${key}":`, error)
    }
  }

  /**
   * Clear all app-related keys from localStorage
   */
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('[StorageService] Failed to clear storage:', error)
    }
  }

  /**
   * Save the API key
   * @param {string} apiKey - Gemini API key
   */
  saveApiKey(apiKey) {
    this.set(STORAGE_KEYS.API_KEY, apiKey)
  }

  /**
   * Load the API key
   * @returns {string} API key or empty string
   */
  loadApiKey() {
    return this.get(STORAGE_KEYS.API_KEY, '')
  }

  /**
   * Save application settings
   * @param {Object} settings - Settings object
   */
  saveSettings(settings) {
    this.set(STORAGE_KEYS.SETTINGS, settings)
  }

  /**
   * Load application settings
   * @returns {Object|null} Settings object
   */
  loadSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, null)
  }

  /**
   * Save prompts data
   * @param {Array} prompts - Array of prompt objects
   */
  savePrompts(prompts) {
    this.set(STORAGE_KEYS.PROMPTS, prompts)
  }

  /**
   * Load prompts data
   * @returns {Array} Array of prompt objects
   */
  loadPrompts() {
    return this.get(STORAGE_KEYS.PROMPTS, [])
  }

  /**
   * Save categories
   * @param {Array} categories - Array of category strings
   */
  saveCategories(categories) {
    this.set(STORAGE_KEYS.CATEGORIES, categories)
  }

  /**
   * Load categories
   * @returns {Array} Array of category strings
   */
  loadCategories() {
    return this.get(STORAGE_KEYS.CATEGORIES, [])
  }

  /**
   * Save translation progress metadata
   * @param {Object} progress - Progress state object
   */
  saveTranslationProgress(progress) {
    this.set(STORAGE_KEYS.TRANSLATION_PROGRESS, progress)
  }

  /**
   * Load translation progress metadata
   * @returns {Object|null} Progress state
   */
  loadTranslationProgress() {
    return this.get(STORAGE_KEYS.TRANSLATION_PROGRESS, null)
  }

  /**
   * Save the current theme
   * @param {string} theme - 'light' or 'dark'
   */
  saveTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme)
  }

  /**
   * Load the saved theme
   * @returns {string} Theme string
   */
  loadTheme() {
    return this.get(STORAGE_KEYS.THEME, 'light')
  }

  /**
   * Save logs
   * @param {Array} logs - Array of log entries
   */
  saveLogs(logs) {
    this.set(STORAGE_KEYS.LOGS, logs)
  }

  /**
   * Load logs
   * @returns {Array} Array of log entries
   */
  loadLogs() {
    return this.get(STORAGE_KEYS.LOGS, [])
  }

  /**
   * Save export settings
   * @param {Object} settings - Export settings
   */
  saveExportSettings(settings) {
    this.set(STORAGE_KEYS.EXPORT_SETTINGS, settings)
  }

  /**
   * Load export settings
   * @returns {Object|null} Export settings
   */
  loadExportSettings() {
    return this.get(STORAGE_KEYS.EXPORT_SETTINGS, null)
  }

  /**
   * Get the approximate storage usage in bytes
   * @returns {number} Approximate bytes used
   */
  getStorageSize() {
    let total = 0
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key)
      if (item) {
        total += item.length * 2 // UTF-16 encoding
      }
    })
    return total
  }

  /**
   * Format storage size to human-readable string
   * @returns {string} Formatted size string
   */
  getFormattedStorageSize() {
    const bytes = this.getStorageSize()
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

export default new StorageService()

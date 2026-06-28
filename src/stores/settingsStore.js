/**
 * Settings Store — Manages API key, Gemini model settings, and theme
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DEFAULT_SETTINGS } from '@/config/constants'
import StorageService from '@/services/StorageService'

export const useSettingsStore = defineStore('settings', () => {
  /** State */
  const apiKey = ref('')
  const model = ref(DEFAULT_SETTINGS.model)
  const temperature = ref(DEFAULT_SETTINGS.temperature)
  const topP = ref(DEFAULT_SETTINGS.topP)
  const topK = ref(DEFAULT_SETTINGS.topK)
  const maxOutputTokens = ref(DEFAULT_SETTINGS.maxOutputTokens)
  const delayBetweenRequests = ref(DEFAULT_SETTINGS.delayBetweenRequests)
  const batchSize = ref(DEFAULT_SETTINGS.batchSize)
  const theme = ref(DEFAULT_SETTINGS.theme)

  /** Computed */
  const hasApiKey = computed(() => apiKey.value && apiKey.value.trim().length > 0)

  const generationConfig = computed(() => ({
    temperature: temperature.value,
    topP: topP.value,
    topK: topK.value,
    maxOutputTokens: maxOutputTokens.value
  }))

  /** Actions */

  /**
   * Load all settings from localStorage
   */
  function loadFromStorage() {
    const savedKey = StorageService.loadApiKey()
    if (savedKey) apiKey.value = savedKey

    const savedSettings = StorageService.loadSettings()
    if (savedSettings) {
      model.value = savedSettings.model || DEFAULT_SETTINGS.model
      temperature.value = savedSettings.temperature ?? DEFAULT_SETTINGS.temperature
      topP.value = savedSettings.topP ?? DEFAULT_SETTINGS.topP
      topK.value = savedSettings.topK ?? DEFAULT_SETTINGS.topK
      maxOutputTokens.value = savedSettings.maxOutputTokens ?? DEFAULT_SETTINGS.maxOutputTokens
      delayBetweenRequests.value = savedSettings.delayBetweenRequests ?? DEFAULT_SETTINGS.delayBetweenRequests
      batchSize.value = savedSettings.batchSize ?? DEFAULT_SETTINGS.batchSize
    }

    const savedTheme = StorageService.loadTheme()
    if (savedTheme) theme.value = savedTheme
  }

  /**
   * Save all settings to localStorage
   */
  function saveToStorage() {
    StorageService.saveApiKey(apiKey.value)
    StorageService.saveSettings({
      model: model.value,
      temperature: temperature.value,
      topP: topP.value,
      topK: topK.value,
      maxOutputTokens: maxOutputTokens.value,
      delayBetweenRequests: delayBetweenRequests.value,
      batchSize: batchSize.value
    })
    StorageService.saveTheme(theme.value)
  }

  /**
   * Update the API key
   * @param {string} key - New API key
   */
  function setApiKey(key) {
    apiKey.value = key
    StorageService.saveApiKey(key)
  }

  /**
   * Toggle between light and dark theme
   */
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    StorageService.saveTheme(theme.value)
    applyTheme()
  }

  /**
   * Set theme explicitly
   * @param {string} newTheme - 'light' or 'dark'
   */
  function setTheme(newTheme) {
    theme.value = newTheme
    StorageService.saveTheme(newTheme)
    applyTheme()
  }

  /**
   * Apply the current theme to the document
   */
  function applyTheme() {
    document.documentElement.setAttribute('data-bs-theme', theme.value)
    document.body.setAttribute('data-theme', theme.value)
  }

  /**
   * Reset all settings to defaults
   */
  function resetToDefaults() {
    model.value = DEFAULT_SETTINGS.model
    temperature.value = DEFAULT_SETTINGS.temperature
    topP.value = DEFAULT_SETTINGS.topP
    topK.value = DEFAULT_SETTINGS.topK
    maxOutputTokens.value = DEFAULT_SETTINGS.maxOutputTokens
    delayBetweenRequests.value = DEFAULT_SETTINGS.delayBetweenRequests
    batchSize.value = DEFAULT_SETTINGS.batchSize
    saveToStorage()
  }

  return {
    /** State */
    apiKey,
    model,
    temperature,
    topP,
    topK,
    maxOutputTokens,
    delayBetweenRequests,
    batchSize,
    theme,
    /** Computed */
    hasApiKey,
    generationConfig,
    /** Actions */
    loadFromStorage,
    saveToStorage,
    setApiKey,
    toggleTheme,
    setTheme,
    applyTheme,
    resetToDefaults
  }
})

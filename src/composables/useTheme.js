/**
 * useTheme composable — Provides reactive theme management
 */
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

export function useTheme() {
  const settingsStore = useSettingsStore()

  const isDark = computed(() => settingsStore.theme === 'dark')
  const isLight = computed(() => settingsStore.theme === 'light')
  const currentTheme = computed(() => settingsStore.theme)

  /**
   * Toggle theme between light and dark
   */
  function toggleTheme() {
    settingsStore.toggleTheme()
  }

  /**
   * Set a specific theme
   * @param {string} theme - 'light' or 'dark'
   */
  function setTheme(theme) {
    settingsStore.setTheme(theme)
  }

  /**
   * Get the appropriate Bootstrap variant for the current theme
   * @param {string} lightVariant - Variant for light theme
   * @param {string} darkVariant - Variant for dark theme
   * @returns {string} The appropriate variant
   */
  function themeVariant(lightVariant, darkVariant) {
    return isDark.value ? darkVariant : lightVariant
  }

  return {
    isDark,
    isLight,
    currentTheme,
    toggleTheme,
    setTheme,
    themeVariant
  }
}

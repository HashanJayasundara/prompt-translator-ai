/**
 * Prompt Store — Manages all prompt data, categories, filtering, sorting, and pagination
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TRANSLATION_STATUS, PAGINATION } from '@/config/constants'
import StorageService from '@/services/StorageService'

export const usePromptStore = defineStore('prompts', () => {
  /** State */
  const prompts = ref([])
  const categories = ref([])
  const searchQuery = ref('')
  const filterCategory = ref('')
  const filterStatus = ref('')
  const sortField = ref('globalOrder')
  const sortDirection = ref('asc')
  const currentPage = ref(1)
  const pageSize = ref(PAGINATION.DEFAULT_PAGE_SIZE)

  /** Computed — filtered and sorted prompts */
  const filteredPrompts = computed(() => {
    let result = [...prompts.value]

    /** Apply search filter */
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(p =>
        p.originalText.toLowerCase().includes(query) ||
        p.sinhalaTranslation?.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.promptNo.toLowerCase().includes(query)
      )
    }

    /** Apply category filter */
    if (filterCategory.value) {
      result = result.filter(p => p.category === filterCategory.value)
    }

    /** Apply status filter */
    if (filterStatus.value) {
      result = result.filter(p => p.status === filterStatus.value)
    }

    /** Apply sorting */
    result.sort((a, b) => {
      let aVal = a[sortField.value]
      let bVal = b[sortField.value]

      /** Handle numeric sort for promptNo and globalOrder */
      if (sortField.value === 'promptNo' || sortField.value === 'globalOrder') {
        aVal = parseInt(aVal) || 0
        bVal = parseInt(bVal) || 0
      }

      /** Handle string sort */
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal || '').toLowerCase()
      }

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })

    return result
  })

  /** Paginated prompts */
  const paginatedPrompts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredPrompts.value.slice(start, end)
  })

  /** Total pages */
  const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredPrompts.value.length / pageSize.value))
  })

  /** Statistics */
  const totalPrompts = computed(() => prompts.value.length)
  const totalCategories = computed(() => categories.value.length)

  const translatedCount = computed(() =>
    prompts.value.filter(p => p.status === TRANSLATION_STATUS.COMPLETED).length
  )

  const pendingCount = computed(() =>
    prompts.value.filter(p => p.status === TRANSLATION_STATUS.PENDING).length
  )

  const failedCount = computed(() =>
    prompts.value.filter(p => p.status === TRANSLATION_STATUS.FAILED).length
  )

  const translatingCount = computed(() =>
    prompts.value.filter(p => p.status === TRANSLATION_STATUS.TRANSLATING).length
  )

  const progressPercentage = computed(() => {
    if (prompts.value.length === 0) return 0
    return parseFloat(((translatedCount.value / prompts.value.length) * 100).toFixed(1))
  })

  const remainingCount = computed(() =>
    prompts.value.length - translatedCount.value
  )

  /** Actions */

  /**
   * Load prompts and categories from localStorage
   */
  function loadFromStorage() {
    const savedPrompts = StorageService.loadPrompts()
    if (savedPrompts && savedPrompts.length > 0) {
      prompts.value = savedPrompts
    }
    const savedCategories = StorageService.loadCategories()
    if (savedCategories && savedCategories.length > 0) {
      categories.value = savedCategories
    }
  }

  /**
   * Save prompts and categories to localStorage
   */
  function saveToStorage() {
    StorageService.savePrompts(prompts.value)
    StorageService.saveCategories(categories.value)
  }

  /**
   * Set prompts from parsed data
   * @param {Array} newPrompts - Parsed prompt objects
   * @param {Array} newCategories - Parsed category strings
   */
  function setPrompts(newPrompts, newCategories) {
    prompts.value = newPrompts
    categories.value = newCategories
    currentPage.value = 1
    saveToStorage()
  }

  /**
   * Append additional prompts (for multiple file uploads)
   * @param {Array} newPrompts - Additional prompt objects
   * @param {Array} newCategories - Additional category strings
   */
  function appendPrompts(newPrompts, newCategories) {
    /** Adjust global order for new prompts */
    const maxOrder = prompts.value.reduce((max, p) => Math.max(max, p.globalOrder || 0), 0)
    const adjustedPrompts = newPrompts.map((p, idx) => ({
      ...p,
      globalOrder: maxOrder + idx + 1
    }))

    prompts.value = [...prompts.value, ...adjustedPrompts]

    /** Merge categories */
    const allCategories = new Set([...categories.value, ...newCategories])
    categories.value = Array.from(allCategories)

    saveToStorage()
  }

  /**
   * Update a single prompt's translation
   * @param {string} promptId - Prompt ID
   * @param {Object} updates - Fields to update
   */
  function updatePrompt(promptId, updates) {
    const index = prompts.value.findIndex(p => p.id === promptId)
    if (index !== -1) {
      prompts.value[index] = { ...prompts.value[index], ...updates }
    }
  }

  /**
   * Update translation for a prompt
   * @param {string} promptId - Prompt ID
   * @param {string} translation - Sinhala translation
   */
  function setTranslation(promptId, translation) {
    updatePrompt(promptId, {
      sinhalaTranslation: translation,
      status: TRANSLATION_STATUS.COMPLETED,
      translatedAt: new Date().toISOString(),
      error: null
    })
  }

  /**
   * Mark a prompt as failed
   * @param {string} promptId - Prompt ID
   * @param {string} error - Error message
   */
  function setTranslationFailed(promptId, error) {
    updatePrompt(promptId, {
      status: TRANSLATION_STATUS.FAILED,
      error
    })
  }

  /**
   * Mark a prompt as translating
   * @param {string} promptId - Prompt ID
   */
  function setTranslating(promptId) {
    updatePrompt(promptId, {
      status: TRANSLATION_STATUS.TRANSLATING,
      error: null
    })
  }

  /**
   * Reset a prompt's translation status to pending
   * @param {string} promptId - Prompt ID
   */
  function resetPrompt(promptId) {
    updatePrompt(promptId, {
      status: TRANSLATION_STATUS.PENDING,
      sinhalaTranslation: '',
      translatedAt: null,
      error: null
    })
  }

  /**
   * Delete a single prompt
   * @param {string} promptId - Prompt ID
   */
  function deletePrompt(promptId) {
    prompts.value = prompts.value.filter(p => p.id !== promptId)
    _recalculateCategories()
    saveToStorage()
  }

  /**
   * Delete all prompts
   */
  function clearAllPrompts() {
    prompts.value = []
    categories.value = []
    currentPage.value = 1
    saveToStorage()
  }

  /**
   * Get prompts by status
   * @param {string} status - Translation status
   * @returns {Array} Filtered prompts
   */
  function getPromptsByStatus(status) {
    return prompts.value.filter(p => p.status === status)
  }

  /**
   * Get prompts by category
   * @param {string} category - Category name
   * @returns {Array} Filtered prompts
   */
  function getPromptsByCategory(category) {
    return prompts.value.filter(p => p.category === category)
  }

  /**
   * Set sort configuration
   * @param {string} field - Field to sort by
   */
  function setSort(field) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
    currentPage.value = 1
  }

  /**
   * Set search query
   * @param {string} query - Search text
   */
  function setSearch(query) {
    searchQuery.value = query
    currentPage.value = 1
  }

  /**
   * Set page
   * @param {number} page - Page number
   */
  function setPage(page) {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  /**
   * Recalculate categories from current prompts
   */
  function _recalculateCategories() {
    const cats = new Set(prompts.value.map(p => p.category))
    categories.value = Array.from(cats)
  }

  return {
    /** State */
    prompts,
    categories,
    searchQuery,
    filterCategory,
    filterStatus,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    /** Computed */
    filteredPrompts,
    paginatedPrompts,
    totalPages,
    totalPrompts,
    totalCategories,
    translatedCount,
    pendingCount,
    failedCount,
    translatingCount,
    progressPercentage,
    remainingCount,
    /** Actions */
    loadFromStorage,
    saveToStorage,
    setPrompts,
    appendPrompts,
    updatePrompt,
    setTranslation,
    setTranslationFailed,
    setTranslating,
    resetPrompt,
    deletePrompt,
    clearAllPrompts,
    getPromptsByStatus,
    getPromptsByCategory,
    setSort,
    setSearch,
    setPage
  }
})

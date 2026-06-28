/**
 * Utility helper functions used throughout the application
 */

/**
 * Generate a unique ID string
 * @returns {string} UUID-like string
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Format a date to a localized string
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale string
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'en-US') {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format a short date without time
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatShortDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncateText(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str || ''
  return str.substring(0, maxLength) + '...'
}

/**
 * Calculate percentage with precision
 * @param {number} part - The part value
 * @param {number} total - The total value
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage value
 */
export function calculatePercentage(part, total, decimals = 1) {
  if (total === 0) return 0
  return parseFloat(((part / total) * 100).toFixed(decimals))
}

/**
 * Format a duration in milliseconds to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function formatDuration(ms) {
  if (!ms || ms <= 0) return '0s'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Estimate remaining time based on progress
 * @param {number} completed - Number of completed items
 * @param {number} total - Total number of items
 * @param {number} elapsedMs - Elapsed time in milliseconds
 * @returns {string} Estimated remaining time
 */
export function estimateRemainingTime(completed, total, elapsedMs) {
  if (completed === 0 || total === 0) return 'Calculating...'
  const remaining = total - completed
  const avgTimePerItem = elapsedMs / completed
  const estimatedRemainingMs = remaining * avgTimePerItem
  return formatDuration(estimatedRemainingMs)
}

/**
 * Deep clone an object using structured clone
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  try {
    return structuredClone(obj)
  } catch {
    return JSON.parse(JSON.stringify(obj))
  }
}

/**
 * Debounce a function call
 * @param {Function} fn - Function to debounce
 * @param {number} waitMs - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, waitMs = 300) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), waitMs)
  }
}

/**
 * Download a Blob as a file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for the download
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Sanitize a string for use in filenames
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeFilename(str) {
  return str.replace(/[^a-z0-9_\-\s]/gi, '').replace(/\s+/g, '_').substring(0, 100)
}

/**
 * Parse CSV content into an array of rows
 * @param {string} content - CSV content string
 * @returns {string[][]} Parsed rows
 */
export function parseCSV(content) {
  const rows = []
  const lines = content.split(/\r?\n/)
  for (const line of lines) {
    if (line.trim()) {
      /** Simple CSV parse — handles quoted values */
      const cells = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      cells.push(current.trim())
      rows.push(cells)
    }
  }
  return rows
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 * @param {any} value - Value to check
 * @returns {boolean} Whether the value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Whether the copy succeeded
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    /** Fallback for older browsers */
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * ParserService — Parses uploaded file content and extracts categories, prompt numbers, and prompt text
 */
import mammoth from 'mammoth'
import { generateId, parseCSV } from '@/utils/helpers'
import { TRANSLATION_STATUS } from '@/config/constants'

class ParserService {
  /**
   * Parse a file based on its type
   * @param {File} file - The uploaded file
   * @returns {Promise<{success: boolean, prompts: Array, categories: Array, error: string|null}>}
   */
  async parseFile(file) {
    try {
      const extension = file.name.split('.').pop().toLowerCase()

      switch (extension) {
        case 'txt':
          return await this._parseTxt(file)
        case 'csv':
          return await this._parseCsv(file)
        case 'docx':
          return await this._parseDocx(file)
        default:
          return {
            success: false,
            prompts: [],
            categories: [],
            error: `Unsupported file type: .${extension}`
          }
      }
    } catch (error) {
      return {
        success: false,
        prompts: [],
        categories: [],
        error: `Failed to parse file: ${error.message}`
      }
    }
  }

  /**
   * Parse a plain text file
   * Text files are expected to have categories as headings and prompts as numbered lines
   * @param {File} file - TXT file
   * @returns {Promise<Object>} Parsed result
   */
  async _parseTxt(file) {
    const content = await this._readFileAsText(file)
    return this._parseTextContent(content)
  }

  /**
   * Parse a CSV file
   * CSV columns: Category, PromptNumber, PromptText
   * @param {File} file - CSV file
   * @returns {Promise<Object>} Parsed result
   */
  async _parseCsv(file) {
    const content = await this._readFileAsText(file)
    const rows = parseCSV(content)

    if (rows.length === 0) {
      return { success: false, prompts: [], categories: [], error: 'CSV file is empty' }
    }

    const prompts = []
    const categoriesSet = new Set()
    let currentCategory = 'General'

    /** Check if first row is a header */
    const firstRow = rows[0]
    const isHeader = firstRow.some(cell =>
      /^(category|prompt|number|text|sn|no)/i.test(cell)
    )
    const startIdx = isHeader ? 1 : 0

    for (let i = startIdx; i < rows.length; i++) {
      const row = rows[i]
      if (row.length === 0 || row.every(cell => !cell.trim())) continue

      if (row.length === 1 && row[0].trim()) {
        /** Single column row — likely a category header */
        currentCategory = row[0].trim()
        categoriesSet.add(currentCategory)
        continue
      }

      /** Try to extract category, number, text from columns */
      let category, promptNo, promptText

      if (row.length >= 3) {
        category = row[0].trim() || currentCategory
        promptNo = row[1].trim()
        promptText = row.slice(2).join(', ').trim()
      } else if (row.length === 2) {
        category = currentCategory
        promptNo = row[0].trim()
        promptText = row[1].trim()
      } else {
        category = currentCategory
        promptNo = String(prompts.length + 1)
        promptText = row[0].trim()
      }

      if (promptText) {
        categoriesSet.add(category)
        prompts.push(this._createPromptObject(category, promptNo, promptText, prompts.length + 1))
      }
    }

    if (prompts.length === 0) {
      return { success: false, prompts: [], categories: [], error: 'No prompts found in CSV file' }
    }

    return {
      success: true,
      prompts,
      categories: Array.from(categoriesSet),
      error: null
    }
  }

  /**
   * Parse a DOCX file using mammoth
   * @param {File} file - DOCX file
   * @returns {Promise<Object>} Parsed result
   */
  async _parseDocx(file) {
    const arrayBuffer = await this._readFileAsArrayBuffer(file)
    const result = await mammoth.extractRawText({ arrayBuffer })
    const content = result.value
    return this._parseTextContent(content)
  }

  /**
   * Parse raw text content into structured prompts
   * Detects categories (lines that look like headings) and numbered prompts
   * @param {string} content - Raw text content
   * @returns {Object} Parsed result
   */
  _parseTextContent(content) {
    const lines = content.split(/\r?\n/)
    const prompts = []
    const categoriesSet = new Set()
    let currentCategory = 'General'
    let globalOrder = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      /** Detect category headers */
      if (this._isCategoryLine(line)) {
        currentCategory = this._cleanCategoryName(line)
        categoriesSet.add(currentCategory)
        continue
      }

      /** Detect numbered prompts: "1. prompt text" or "1) prompt text" or just text */
      const promptMatch = line.match(/^(\d+)[.):\-]\s*(.+)/)
      if (promptMatch) {
        const promptNo = promptMatch[1]
        const promptText = promptMatch[2].trim()

        if (promptText) {
          globalOrder++
          if (!categoriesSet.has(currentCategory)) categoriesSet.add(currentCategory)
          prompts.push(this._createPromptObject(currentCategory, promptNo, promptText, globalOrder))
        }
      } else if (!this._isMetadataLine(line)) {
        /** Treat non-category, non-metadata lines as prompts */
        globalOrder++
        const promptNo = String(globalOrder)
        if (!categoriesSet.has(currentCategory)) categoriesSet.add(currentCategory)
        prompts.push(this._createPromptObject(currentCategory, promptNo, line, globalOrder))
      }
    }

    if (prompts.length === 0) {
      return { success: false, prompts: [], categories: [], error: 'No prompts found in the file' }
    }

    return {
      success: true,
      prompts,
      categories: Array.from(categoriesSet),
      error: null
    }
  }

  /**
   * Check if a line is a category header
   * @param {string} line - Line text
   * @returns {boolean}
   */
  _isCategoryLine(line) {
    /** Lines that are all caps, or end with colon, or are short and non-numeric */
    if (/^#{1,3}\s+/.test(line)) return true
    if (/^[A-Z][A-Z\s&/,\-]{2,}$/.test(line)) return true
    if (/^(?:Category|Section|Group|Topic)[\s:]+/i.test(line)) return true
    if (line.endsWith(':') && line.length < 80 && !/^\d/.test(line)) return true
    if (/^\*\*(.+)\*\*$/.test(line)) return true
    /** Lines that are short, start with uppercase, and have no numbers at start */
    if (line.length < 60 && /^[A-Z]/.test(line) && !/^\d/.test(line) && !/[.!?]$/.test(line)) {
      /** Heuristic: if it's much shorter than surrounding lines, it's likely a heading */
      const words = line.split(/\s+/)
      if (words.length <= 6) return true
    }
    return false
  }

  /**
   * Clean a category name from various formats
   * @param {string} line - Raw category line
   * @returns {string} Cleaned category name
   */
  _cleanCategoryName(line) {
    return line
      .replace(/^#{1,3}\s+/, '')
      .replace(/^(?:Category|Section|Group|Topic)[\s:]+/i, '')
      .replace(/^\*\*(.+)\*\*$/, '$1')
      .replace(/:$/, '')
      .trim()
  }

  /**
   * Check if a line is metadata (not a prompt or category)
   * @param {string} line - Line text
   * @returns {boolean}
   */
  _isMetadataLine(line) {
    /** Skip lines that are clearly metadata */
    if (/^(Total|Count|Note|Page|---)/i.test(line)) return true
    if (line.length < 3) return true
    return false
  }

  /**
   * Create a standardized prompt object
   * @param {string} category - Category name
   * @param {string} promptNo - Prompt number within category
   * @param {string} promptText - The prompt text
   * @param {number} globalOrder - Global ordering index
   * @returns {Object} Prompt object
   */
  _createPromptObject(category, promptNo, promptText, globalOrder) {
    return {
      id: generateId(),
      category,
      promptNo: String(promptNo),
      originalText: promptText,
      sinhalaTranslation: '',
      status: TRANSLATION_STATUS.PENDING,
      translatedAt: null,
      globalOrder,
      error: null
    }
  }

  /**
   * Read a file as text
   * @param {File} file - File to read
   * @returns {Promise<string>} File content as string
   */
  _readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  /**
   * Read a file as ArrayBuffer
   * @param {File} file - File to read
   * @returns {Promise<ArrayBuffer>} File content as ArrayBuffer
   */
  _readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }
}

export default new ParserService()

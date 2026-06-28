/**
 * ExportExcelService — Generates XLSX files with category-wise sheets
 */
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

class ExportExcelService {
  /**
   * Export prompts to an XLSX file
   * @param {Array} prompts - Array of prompt objects
   * @param {Array} categories - Array of category strings
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportToExcel(prompts, categories, options = {}) {
    const {
      filename = 'Prompt_Translations',
      includeAllPrompts = true
    } = options

    /** Filter prompts if needed */
    const filteredPrompts = includeAllPrompts
      ? prompts
      : prompts.filter(p => p.status === 'completed')

    /** Create workbook */
    const workbook = XLSX.utils.book_new()

    /** Create an "All Prompts" sheet first */
    const allData = this._buildSheetData(filteredPrompts)
    const allSheet = XLSX.utils.aoa_to_sheet(allData)
    this._applyColumnWidths(allSheet, allData)
    XLSX.utils.book_append_sheet(workbook, allSheet, 'All Prompts')

    /** Create category-wise sheets */
    for (const category of categories) {
      const categoryPrompts = filteredPrompts
        .filter(p => p.category === category)
        .sort((a, b) => parseInt(a.promptNo) - parseInt(b.promptNo))

      if (categoryPrompts.length === 0) continue

      const sheetData = this._buildSheetData(categoryPrompts)
      const sheet = XLSX.utils.aoa_to_sheet(sheetData)
      this._applyColumnWidths(sheet, sheetData)

      /** Sanitize sheet name (max 31 chars, no special chars) */
      const sheetName = category.substring(0, 31).replace(/[\\/*?:\[\]]/g, '_')
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
    }

    /** Generate the file */
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `${filename}.xlsx`)
  }

  /**
   * Build sheet data as a 2D array
   * @param {Array} prompts - Prompts to include
   * @returns {Array[]} 2D array of cell values
   */
  _buildSheetData(prompts) {
    /** Header row */
    const data = [
      ['SN', 'Prompt No', 'Category', 'Date', 'Prompt', 'Prompt in Sinhala Translation', 'Completed Status']
    ]

    /** Data rows */
    prompts.forEach((prompt, index) => {
      data.push([
        index + 1,
        prompt.promptNo,
        prompt.category,
        '', // Date column empty
        prompt.originalText,
        prompt.sinhalaTranslation || '',
        '' // Completed Status empty
      ])
    })

    return data
  }

  /**
   * Apply auto column widths based on content
   * @param {Object} sheet - XLSX sheet object
   * @param {Array[]} data - 2D data array
   */
  _applyColumnWidths(sheet, data) {
    const colWidths = []
    if (data.length === 0) return

    const numCols = data[0].length
    for (let col = 0; col < numCols; col++) {
      let maxWidth = 10
      for (let row = 0; row < data.length; row++) {
        const cellValue = String(data[row][col] || '')
        const cellWidth = Math.min(cellValue.length + 2, 60)
        if (cellWidth > maxWidth) maxWidth = cellWidth
      }
      colWidths.push({ wch: maxWidth })
    }

    sheet['!cols'] = colWidths
  }
}

export default new ExportExcelService()

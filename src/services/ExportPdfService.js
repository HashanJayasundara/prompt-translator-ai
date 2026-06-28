/**
 * ExportPdfService — Generates professional PDF files with category-wise tables
 */
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { saveAs } from 'file-saver'

class ExportPdfService {
  /**
   * Export prompts to a PDF file
   * @param {Array} prompts - Array of prompt objects
   * @param {Array} categories - Array of category strings
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportToPdf(prompts, categories, options = {}) {
    const {
      filename = 'Prompt_Translations',
      title = 'AI Prompt Translations - English to Sinhala',
      includeAllPrompts = true
    } = options

    /** Filter prompts if needed */
    const filteredPrompts = includeAllPrompts
      ? prompts
      : prompts.filter(p => p.status === 'completed')

    /** Create PDF in landscape mode */
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()

    /** Title page */
    doc.setFontSize(24)
    doc.setTextColor(37, 99, 235) // Blue
    doc.text(title, pageWidth / 2, 30, { align: 'center' })

    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      pageWidth / 2,
      42,
      { align: 'center' }
    )

    doc.setFontSize(11)
    doc.text(`Total Prompts: ${filteredPrompts.length}`, pageWidth / 2, 54, { align: 'center' })
    doc.text(`Categories: ${categories.length}`, pageWidth / 2, 62, { align: 'center' })

    let startY = 80

    /** Process each category */
    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const category = categories[catIdx]
      const categoryPrompts = filteredPrompts
        .filter(p => p.category === category)
        .sort((a, b) => parseInt(a.promptNo) - parseInt(b.promptNo))

      if (categoryPrompts.length === 0) continue

      /** Add new page for each category after the first if needed */
      if (catIdx > 0) {
        doc.addPage()
        startY = 20
      }

      /** Category heading */
      doc.setFontSize(16)
      doc.setTextColor(30, 64, 175)
      doc.text(category, 14, startY)
      startY += 8

      /** Build table data */
      const tableData = categoryPrompts.map((prompt, index) => [
        String(index + 1),
        prompt.promptNo,
        '', // Date empty
        prompt.originalText.substring(0, 120),
        (prompt.sinhalaTranslation || '').substring(0, 120),
        '' // Status empty
      ])

      /** Draw the table */
      doc.autoTable({
        startY,
        head: [['SN', 'Prompt No', 'Date', 'Prompt', 'Prompt in Sinhala Translation', 'Status']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          font: 'helvetica',
          overflow: 'linebreak',
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 247, 255]
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 25 },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 'auto' },
          5: { cellWidth: 22, halign: 'center' }
        },
        didDrawPage: (data) => {
          /** Footer with page numbers */
          const pageHeight = doc.internal.pageSize.getHeight()
          doc.setFontSize(8)
          doc.setTextColor(150, 150, 150)
          doc.text(
            `Prompt Translator AI — Page ${doc.internal.getNumberOfPages()}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          )
        },
        margin: { top: 20, right: 14, bottom: 20, left: 14 }
      })

      startY = doc.lastAutoTable.finalY + 15
    }

    /** Save the PDF */
    const pdfBlob = doc.output('blob')
    saveAs(pdfBlob, `${filename}.pdf`)
  }
}

export default new ExportPdfService()

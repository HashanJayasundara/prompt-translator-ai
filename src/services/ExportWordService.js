/**
 * ExportWordService — Generates professional DOCX files with category-wise tables
 */
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  PageOrientation,
  Header,
  Footer,
  PageNumber,
  PageNumberSeparator,
  ShadingType
} from 'docx'
import { saveAs } from 'file-saver'

class ExportWordService {
  /**
   * Export prompts to a DOCX file with category-wise tables
   * @param {Array} prompts - Array of prompt objects
   * @param {Array} categories - Array of category strings
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportToDocx(prompts, categories, options = {}) {
    const {
      filename = 'Prompt_Translations',
      title = 'AI Prompt Translations - English to Sinhala',
      includeAllPrompts = true
    } = options

    /** Filter prompts if needed */
    const filteredPrompts = includeAllPrompts
      ? prompts
      : prompts.filter(p => p.status === 'completed')

    /** Build document sections — one section per category */
    const children = []

    /** Title */
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 32,
            font: 'Calibri',
            color: '2563EB'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    )

    /** Generated date */
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
            size: 20,
            font: 'Calibri',
            color: '666666',
            italics: true
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      })
    )

    /** Process each category */
    for (const category of categories) {
      const categoryPrompts = filteredPrompts
        .filter(p => p.category === category)
        .sort((a, b) => parseInt(a.promptNo) - parseInt(b.promptNo))

      if (categoryPrompts.length === 0) continue

      /** Category heading */
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: category,
              bold: true,
              size: 26,
              font: 'Calibri',
              color: '1E40AF'
            })
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      )

      /** Build the table for this category */
      const table = this._buildCategoryTable(categoryPrompts)
      children.push(table)

      /** Spacer after table */
      children.push(
        new Paragraph({
          children: [],
          spacing: { after: 400 }
        })
      )
    }

    /** Create the document */
    const doc = new Document({
      creator: 'Prompt Translator AI',
      title,
      description: 'AI prompt translations from English to Sinhala',
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.LANDSCAPE
              },
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Prompt Translator AI — Translation Report',
                      size: 16,
                      font: 'Calibri',
                      color: '999999',
                      italics: true
                    })
                  ],
                  alignment: AlignmentType.RIGHT
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Page ',
                      size: 16,
                      font: 'Calibri',
                      color: '999999'
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 16,
                      font: 'Calibri',
                      color: '999999'
                    }),
                    new TextRun({
                      children: [' of ', PageNumber.TOTAL_PAGES],
                      size: 16,
                      font: 'Calibri',
                      color: '999999'
                    })
                  ],
                  alignment: AlignmentType.CENTER
                })
              ]
            })
          },
          children
        }
      ]
    })

    /** Generate and download the file */
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${filename}.docx`)
  }

  /**
   * Build a table for a single category
   * @param {Array} prompts - Prompts for this category
   * @returns {Table} docx Table object
   */
  _buildCategoryTable(prompts) {
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        this._createHeaderCell('SN', 600),
        this._createHeaderCell('Prompt No', 1000),
        this._createHeaderCell('Date', 1400),
        this._createHeaderCell('Prompt', 4000),
        this._createHeaderCell('Prompt in Sinhala Translation', 4000),
        this._createHeaderCell('Completed Status', 1400)
      ]
    })

    const dataRows = prompts.map((prompt, index) => {
      return new TableRow({
        children: [
          this._createDataCell(String(index + 1), 600),
          this._createDataCell(prompt.promptNo, 1000),
          this._createDataCell('', 1400), // Date column empty as requested
          this._createDataCell(prompt.originalText, 4000),
          this._createDataCell(prompt.sinhalaTranslation || '', 4000),
          this._createDataCell('', 1400) // Completed Status column empty as requested
        ]
      })
    })

    return new Table({
      rows: [headerRow, ...dataRows],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      }
    })
  }

  /**
   * Create a styled header cell
   * @param {string} text - Cell text
   * @param {number} width - Cell width in twips
   * @returns {TableCell}
   */
  _createHeaderCell(text, width) {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: true,
              size: 20,
              font: 'Calibri',
              color: 'FFFFFF'
            })
          ],
          alignment: AlignmentType.CENTER
        })
      ],
      width: { size: width, type: WidthType.DXA },
      shading: {
        type: ShadingType.SOLID,
        color: '2563EB',
        fill: '2563EB'
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '1E40AF' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '1E40AF' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '1E40AF' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '1E40AF' }
      }
    })
  }

  /**
   * Create a styled data cell
   * @param {string} text - Cell text
   * @param {number} width - Cell width in twips
   * @returns {TableCell}
   */
  _createDataCell(text, width) {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: text || '',
              size: 18,
              font: 'Calibri'
            })
          ]
        })
      ],
      width: { size: width, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
        left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
        right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' }
      }
    })
  }
}

export default new ExportWordService()

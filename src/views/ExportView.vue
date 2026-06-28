<template>
  <div class="animate-fade-in-up">
    <!-- Page header -->
    <div class="page-header">
      <h2>Export</h2>
      <p>Export your translated prompts to Word, Excel, or PDF format</p>
    </div>

    <!-- No data warning -->
    <div v-if="promptStore.totalPrompts === 0" class="card-custom">
      <div class="empty-state">
        <i class="bi bi-download d-block"></i>
        <h5>No Data to Export</h5>
        <p>Upload and translate prompts before exporting</p>
        <router-link to="/upload" class="btn btn-primary-custom mt-3">
          <i class="bi bi-cloud-upload me-2"></i>Upload Prompts
        </router-link>
      </div>
    </div>

    <div v-else>
      <div class="row g-4">
        <!-- Export options -->
        <div class="col-lg-8">
          <!-- Export format cards -->
          <div class="row g-3 mb-4">
            <!-- DOCX -->
            <div class="col-md-4">
              <div
                class="card-custom cursor-pointer h-100"
                :class="{ 'border-primary': selectedFormat === 'docx' }"
                @click="selectedFormat = 'docx'"
                style="border-width: 2px;"
              >
                <div class="card-body text-center p-4">
                  <div
                    class="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style="width: 56px; height: 56px; background: var(--accent-primary-light);"
                  >
                    <i class="bi bi-file-earmark-word" style="font-size: 1.5rem; color: var(--accent-primary);"></i>
                  </div>
                  <h6 class="fw-bold">Word (DOCX)</h6>
                  <p class="text-muted mb-0" style="font-size: 0.8rem;">
                    Professional tables with category headings
                  </p>
                </div>
              </div>
            </div>

            <!-- XLSX -->
            <div class="col-md-4">
              <div
                class="card-custom cursor-pointer h-100"
                :class="{ 'border-success': selectedFormat === 'xlsx' }"
                @click="selectedFormat = 'xlsx'"
                style="border-width: 2px;"
              >
                <div class="card-body text-center p-4">
                  <div
                    class="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style="width: 56px; height: 56px; background: var(--accent-success-light);"
                  >
                    <i class="bi bi-file-earmark-excel" style="font-size: 1.5rem; color: var(--accent-success);"></i>
                  </div>
                  <h6 class="fw-bold">Excel (XLSX)</h6>
                  <p class="text-muted mb-0" style="font-size: 0.8rem;">
                    Spreadsheet with category sheets
                  </p>
                </div>
              </div>
            </div>

            <!-- PDF -->
            <div class="col-md-4">
              <div
                class="card-custom cursor-pointer h-100"
                :class="{ 'border-danger': selectedFormat === 'pdf' }"
                @click="selectedFormat = 'pdf'"
                style="border-width: 2px;"
              >
                <div class="card-body text-center p-4">
                  <div
                    class="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style="width: 56px; height: 56px; background: var(--accent-danger-light);"
                  >
                    <i class="bi bi-file-earmark-pdf" style="font-size: 1.5rem; color: var(--accent-danger);"></i>
                  </div>
                  <h6 class="fw-bold">PDF</h6>
                  <p class="text-muted mb-0" style="font-size: 0.8rem;">
                    Landscape PDF with formatted tables
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Export settings -->
          <div class="card-custom mb-3">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-gear me-2 text-primary"></i>Export Settings
              </h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label-custom">Filename</label>
                  <input
                    type="text"
                    class="form-control form-control-custom"
                    v-model="exportFilename"
                    placeholder="Prompt_Translations"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">Document Title</label>
                  <input
                    type="text"
                    class="form-control form-control-custom"
                    v-model="exportTitle"
                    placeholder="AI Prompt Translations"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">Include Prompts</label>
                  <select class="form-select form-select-custom" v-model="includeAll">
                    <option :value="true">All Prompts</option>
                    <option :value="false">Translated Only</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label-custom">Categories</label>
                  <select class="form-select form-select-custom" v-model="exportCategory">
                    <option value="">All Categories</option>
                    <option v-for="cat in promptStore.categories" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Export button -->
          <div class="card-custom">
            <div class="card-body">
              <div class="d-flex flex-wrap gap-3">
                <button
                  class="btn btn-primary-custom btn-lg"
                  :disabled="isExporting"
                  @click="performExport"
                >
                  <span v-if="isExporting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-download me-2"></i>
                  Export as {{ selectedFormat.toUpperCase() }}
                </button>

                <button
                  class="btn btn-secondary-custom btn-lg"
                  :disabled="isExporting"
                  @click="exportAll"
                >
                  <i class="bi bi-files me-2"></i>Export All Formats
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Export info -->
        <div class="col-lg-4">
          <!-- Data summary -->
          <div class="card-custom mb-3">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-info-circle me-2 text-info"></i>Data Summary
              </h6>
              <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
                <span class="text-muted">Total prompts</span>
                <span class="fw-bold">{{ promptStore.totalPrompts }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
                <span class="text-muted">Translated</span>
                <span class="fw-bold text-success">{{ promptStore.translatedCount }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
                <span class="text-muted">Pending</span>
                <span class="fw-bold text-warning">{{ promptStore.pendingCount }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
                <span class="text-muted">Categories</span>
                <span class="fw-bold">{{ promptStore.totalCategories }}</span>
              </div>
              <div class="d-flex justify-content-between" style="font-size: 0.85rem;">
                <span class="text-muted">Will export</span>
                <span class="fw-bold text-primary">{{ exportCount }} prompts</span>
              </div>
            </div>
          </div>

          <!-- Format details -->
          <div class="card-custom">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-file-earmark me-2 text-primary"></i>
                {{ selectedFormat.toUpperCase() }} Details
              </h6>
              <ul class="list-unstyled mb-0" style="font-size: 0.8rem; color: var(--text-secondary);">
                <template v-if="selectedFormat === 'docx'">
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Landscape orientation</span>
                  </li>
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Category-wise tables</span>
                  </li>
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Professional formatting</span>
                  </li>
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Headers and footers</span>
                  </li>
                  <li class="d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Page numbers</span>
                  </li>
                </template>
                <template v-else-if="selectedFormat === 'xlsx'">
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>"All Prompts" summary sheet</span>
                  </li>
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Category-wise sheets</span>
                  </li>
                  <li class="d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Auto column widths</span>
                  </li>
                </template>
                <template v-else>
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Landscape A4 format</span>
                  </li>
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Category tables with headers</span>
                  </li>
                  <li class="mb-2 d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Alternating row colors</span>
                  </li>
                  <li class="d-flex gap-2">
                    <i class="bi bi-check-lg text-success"></i>
                    <span>Page numbers in footer</span>
                  </li>
                </template>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { useLogStore } from '@/stores/logStore'
import ExportWordService from '@/services/ExportWordService'
import ExportExcelService from '@/services/ExportExcelService'
import ExportPdfService from '@/services/ExportPdfService'
import NotificationService from '@/services/NotificationService'

const promptStore = usePromptStore()
const logStore = useLogStore()

/** Refs */
const selectedFormat = ref('docx')
const exportFilename = ref('Prompt_Translations')
const exportTitle = ref('AI Prompt Translations - English to Sinhala')
const includeAll = ref(true)
const exportCategory = ref('')
const isExporting = ref(false)

/** Computed: count of prompts to export */
const exportCount = computed(() => {
  let result = promptStore.prompts
  if (!includeAll.value) {
    result = result.filter(p => p.status === 'completed')
  }
  if (exportCategory.value) {
    result = result.filter(p => p.category === exportCategory.value)
  }
  return result.length
})

/** Get prompts and categories for export */
function getExportData() {
  let prompts = [...promptStore.prompts]
  if (!includeAll.value) {
    prompts = prompts.filter(p => p.status === 'completed')
  }
  if (exportCategory.value) {
    prompts = prompts.filter(p => p.category === exportCategory.value)
  }

  let categories = exportCategory.value
    ? [exportCategory.value]
    : promptStore.categories.filter(cat => prompts.some(p => p.category === cat))

  return { prompts, categories }
}

/** Perform export in selected format */
async function performExport() {
  isExporting.value = true

  try {
    const { prompts, categories } = getExportData()
    const options = {
      filename: exportFilename.value || 'Prompt_Translations',
      title: exportTitle.value || 'AI Prompt Translations',
      includeAllPrompts: includeAll.value
    }

    switch (selectedFormat.value) {
      case 'docx':
        await ExportWordService.exportToDocx(prompts, categories, options)
        break
      case 'xlsx':
        await ExportExcelService.exportToExcel(prompts, categories, options)
        break
      case 'pdf':
        await ExportPdfService.exportToPdf(prompts, categories, options)
        break
    }

    NotificationService.success(`Exported ${prompts.length} prompts as ${selectedFormat.value.toUpperCase()}!`)
    logStore.addLog('success', `Exported ${prompts.length} prompts as ${selectedFormat.value.toUpperCase()}`)
  } catch (error) {
    NotificationService.error(`Export failed: ${error.message}`)
    logStore.addLog('error', `Export failed: ${error.message}`)
  } finally {
    isExporting.value = false
  }
}

/** Export all formats */
async function exportAll() {
  isExporting.value = true

  try {
    const { prompts, categories } = getExportData()
    const options = {
      filename: exportFilename.value || 'Prompt_Translations',
      title: exportTitle.value || 'AI Prompt Translations',
      includeAllPrompts: includeAll.value
    }

    await ExportWordService.exportToDocx(prompts, categories, options)
    await ExportExcelService.exportToExcel(prompts, categories, options)
    await ExportPdfService.exportToPdf(prompts, categories, options)

    NotificationService.success('Exported in all 3 formats!')
    logStore.addLog('success', `Exported ${prompts.length} prompts in DOCX, XLSX, and PDF`)
  } catch (error) {
    NotificationService.error(`Export failed: ${error.message}`)
    logStore.addLog('error', `Export all failed: ${error.message}`)
  } finally {
    isExporting.value = false
  }
}
</script>

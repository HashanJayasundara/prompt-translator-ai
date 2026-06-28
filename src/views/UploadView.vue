<template>
  <div class="animate-fade-in-up">
    <!-- Page header -->
    <div class="page-header">
      <h2>Upload Prompts</h2>
      <p>Upload your AI prompt files (TXT, CSV, DOCX) to start translating</p>
    </div>

    <div class="row g-4">
      <!-- Upload zone -->
      <div class="col-lg-8">
        <div class="card-custom">
          <div class="card-body p-4">
            <!-- Drag & Drop Zone -->
            <div
              class="upload-zone"
              :class="{ 'drag-over': isDragOver }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <i class="bi bi-cloud-arrow-up upload-zone-icon"></i>
              <h4>Drag & Drop your file here</h4>
              <p class="mb-3">or click to browse files</p>
              <div class="d-flex justify-content-center gap-2 flex-wrap">
                <span class="badge rounded-pill bg-primary px-3 py-2">
                  <i class="bi bi-file-earmark-text me-1"></i> TXT
                </span>
                <span class="badge rounded-pill bg-success px-3 py-2">
                  <i class="bi bi-file-earmark-spreadsheet me-1"></i> CSV
                </span>
                <span class="badge rounded-pill bg-info px-3 py-2">
                  <i class="bi bi-file-earmark-word me-1"></i> DOCX
                </span>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept=".txt,.csv,.docx"
                class="d-none"
                @change="handleFileSelect"
              />
            </div>

            <!-- Upload progress -->
            <div v-if="isProcessing" class="mt-4">
              <div class="d-flex align-items-center gap-3 mb-2">
                <div class="spinner-custom sm"></div>
                <span class="fw-semibold">Processing file...</span>
              </div>
              <ProgressBar :percentage="uploadProgress" label="Processing" :large="true" />
            </div>

            <!-- Upload result -->
            <div v-if="uploadResult && !isProcessing" class="mt-4 animate-fade-in">
              <div
                class="alert d-flex align-items-start gap-3"
                :class="uploadResult.success ? 'alert-success' : 'alert-danger'"
                style="border-radius: 12px;"
              >
                <i
                  :class="uploadResult.success ? 'bi bi-check-circle-fill text-success' : 'bi bi-x-circle-fill text-danger'"
                  style="font-size: 1.3rem; margin-top: 2px;"
                ></i>
                <div>
                  <h6 class="fw-bold mb-1">
                    {{ uploadResult.success ? 'File Processed Successfully!' : 'Processing Failed' }}
                  </h6>
                  <p class="mb-0" style="font-size: 0.875rem;">
                    {{ uploadResult.success
                      ? `Found ${uploadResult.promptCount} prompts across ${uploadResult.categoryCount} categories.`
                      : uploadResult.error
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- File info (after selecting) -->
        <div v-if="selectedFile" class="card-custom mt-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-file-earmark me-2"></i>Selected File
            </h6>
            <div class="d-flex align-items-center gap-3 p-3 rounded-3" style="background: var(--bg-tertiary);">
              <div
                class="d-flex align-items-center justify-content-center"
                style="width: 48px; height: 48px; border-radius: 12px; background: var(--accent-primary-light);"
              >
                <i :class="fileIcon" style="font-size: 1.3rem; color: var(--accent-primary);"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-semibold">{{ selectedFile.name }}</div>
                <small class="text-muted">{{ formatFileSize(selectedFile.size) }}</small>
              </div>
              <button class="btn-icon" @click="clearFile" title="Remove file">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload help / options -->
      <div class="col-lg-4">
        <!-- Current data info -->
        <div v-if="promptStore.totalPrompts > 0" class="card-custom mb-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-database me-2 text-primary"></i>Current Data
            </h6>
            <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
              <span class="text-muted">Prompts loaded</span>
              <span class="fw-bold">{{ promptStore.totalPrompts }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
              <span class="text-muted">Categories</span>
              <span class="fw-bold">{{ promptStore.totalCategories }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3" style="font-size: 0.85rem;">
              <span class="text-muted">Translated</span>
              <span class="fw-bold text-success">{{ promptStore.translatedCount }}</span>
            </div>

            <!-- Upload mode selection -->
            <div class="mb-3">
              <label class="form-label-custom">Upload Mode</label>
              <div class="d-flex gap-2">
                <button
                  class="btn btn-sm flex-fill"
                  :class="uploadMode === 'replace' ? 'btn-primary-custom' : 'btn-secondary-custom'"
                  @click="uploadMode = 'replace'"
                >
                  <i class="bi bi-arrow-repeat me-1"></i>Replace
                </button>
                <button
                  class="btn btn-sm flex-fill"
                  :class="uploadMode === 'append' ? 'btn-primary-custom' : 'btn-secondary-custom'"
                  @click="uploadMode = 'append'"
                >
                  <i class="bi bi-plus-lg me-1"></i>Append
                </button>
              </div>
            </div>

            <button
              class="btn btn-outline-danger btn-sm w-100"
              @click="showClearConfirm = true"
            >
              <i class="bi bi-trash me-1"></i>Clear All Data
            </button>
          </div>
        </div>

        <!-- Format guide -->
        <div class="card-custom">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-info-circle me-2 text-info"></i>Format Guide
            </h6>

            <div class="mb-3">
              <div class="fw-semibold mb-1" style="font-size: 0.85rem;">
                <i class="bi bi-file-earmark-text text-primary me-1"></i> TXT Format
              </div>
              <div class="p-2 rounded" style="background: var(--bg-tertiary); font-size: 0.75rem; font-family: monospace;">
                Nature Photography<br />
                1. A serene lake at sunset<br />
                2. Mountain peaks with snow<br /><br />
                Portrait Photography<br />
                1. A woman in golden light
              </div>
            </div>

            <div class="mb-3">
              <div class="fw-semibold mb-1" style="font-size: 0.85rem;">
                <i class="bi bi-file-earmark-spreadsheet text-success me-1"></i> CSV Format
              </div>
              <div class="p-2 rounded" style="background: var(--bg-tertiary); font-size: 0.75rem; font-family: monospace;">
                Category,Number,Prompt<br />
                Nature,1,A serene lake<br />
                Portrait,1,A woman in light
              </div>
            </div>

            <div>
              <div class="fw-semibold mb-1" style="font-size: 0.85rem;">
                <i class="bi bi-file-earmark-word text-info me-1"></i> DOCX Format
              </div>
              <p class="text-muted mb-0" style="font-size: 0.8rem;">
                Use headings for categories and numbered lists for prompts. The parser auto-detects the structure.
              </p>
            </div>
          </div>
        </div>

        <!-- Validation info -->
        <div class="card-custom mt-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-shield-check me-2 text-success"></i>Validation
            </h6>
            <ul class="list-unstyled mb-0" style="font-size: 0.8rem;">
              <li class="mb-2 d-flex align-items-start gap-2">
                <i class="bi bi-check-lg text-success mt-1"></i>
                <span>Auto-detects categories and prompt numbers</span>
              </li>
              <li class="mb-2 d-flex align-items-start gap-2">
                <i class="bi bi-check-lg text-success mt-1"></i>
                <span>Preserves original ordering</span>
              </li>
              <li class="mb-2 d-flex align-items-start gap-2">
                <i class="bi bi-check-lg text-success mt-1"></i>
                <span>Handles quoted CSV values</span>
              </li>
              <li class="d-flex align-items-start gap-2">
                <i class="bi bi-check-lg text-success mt-1"></i>
                <span>Supports multiple file uploads</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm clear dialog -->
    <ConfirmDialog
      :show="showClearConfirm"
      title="Clear All Data"
      message="This will permanently delete all prompts, translations, and progress. This action cannot be undone."
      confirm-text="Clear Everything"
      variant="danger"
      @confirm="clearAllData"
      @cancel="showClearConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { useLogStore } from '@/stores/logStore'
import ParserService from '@/services/ParserService'
import NotificationService from '@/services/NotificationService'
import ProgressBar from '@/components/common/ProgressBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const promptStore = usePromptStore()
const logStore = useLogStore()

/** Refs */
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragOver = ref(false)
const isProcessing = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref(null)
const uploadMode = ref('replace')
const showClearConfirm = ref(false)

/** File icon based on extension */
const fileIcon = computed(() => {
  if (!selectedFile.value) return 'bi bi-file-earmark'
  const ext = selectedFile.value.name.split('.').pop().toLowerCase()
  switch (ext) {
    case 'txt': return 'bi bi-file-earmark-text'
    case 'csv': return 'bi bi-file-earmark-spreadsheet'
    case 'docx': return 'bi bi-file-earmark-word'
    default: return 'bi bi-file-earmark'
  }
})

/** Trigger file input click */
function triggerFileInput() {
  fileInput.value?.click()
}

/** Handle file input change */
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) processFile(file)
}

/** Handle drag & drop */
function handleDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) processFile(file)
}

/** Process the uploaded file */
async function processFile(file) {
  /** Validate file type */
  const validExtensions = ['txt', 'csv', 'docx']
  const ext = file.name.split('.').pop().toLowerCase()
  if (!validExtensions.includes(ext)) {
    NotificationService.error(`Unsupported file type: .${ext}. Use TXT, CSV, or DOCX.`)
    return
  }

  /** Validate file size (max 10MB) */
  if (file.size > 10 * 1024 * 1024) {
    NotificationService.error('File size exceeds 10MB limit')
    return
  }

  selectedFile.value = file
  isProcessing.value = true
  uploadProgress.value = 10
  uploadResult.value = null

  logStore.addLog('info', `Processing file: ${file.name} (${formatFileSize(file.size)})`)

  try {
    uploadProgress.value = 30

    /** Parse the file */
    const result = await ParserService.parseFile(file)

    uploadProgress.value = 80

    if (result.success) {
      /** Store the parsed data */
      if (uploadMode.value === 'append' && promptStore.totalPrompts > 0) {
        promptStore.appendPrompts(result.prompts, result.categories)
        logStore.addLog('success', `Appended ${result.prompts.length} prompts from "${file.name}"`)
      } else {
        promptStore.setPrompts(result.prompts, result.categories)
        logStore.addLog('success', `Loaded ${result.prompts.length} prompts in ${result.categories.length} categories from "${file.name}"`)
      }

      uploadResult.value = {
        success: true,
        promptCount: result.prompts.length,
        categoryCount: result.categories.length
      }

      NotificationService.success(`Successfully loaded ${result.prompts.length} prompts!`)
    } else {
      uploadResult.value = {
        success: false,
        error: result.error
      }
      logStore.addLog('error', `Failed to parse "${file.name}": ${result.error}`)
      NotificationService.error(result.error)
    }

    uploadProgress.value = 100
  } catch (error) {
    uploadResult.value = {
      success: false,
      error: error.message
    }
    logStore.addLog('error', `Error processing "${file.name}": ${error.message}`)
    NotificationService.error(`Error: ${error.message}`)
  } finally {
    isProcessing.value = false
  }
}

/** Clear selected file */
function clearFile() {
  selectedFile.value = null
  uploadResult.value = null
  uploadProgress.value = 0
  if (fileInput.value) fileInput.value.value = ''
}

/** Clear all data */
function clearAllData() {
  promptStore.clearAllPrompts()
  showClearConfirm.value = false
  uploadResult.value = null
  selectedFile.value = null
  NotificationService.success('All data cleared')
  logStore.addLog('warning', 'All prompt data cleared')
}

/** Format file size */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="animate-fade-in-up">
    <!-- Page header -->
    <div class="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
      <div>
        <h2>Prompt Table</h2>
        <p>View, search, edit, and manage all your prompts</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <button
          class="btn btn-primary-custom btn-sm"
          :disabled="selectedIds.length === 0"
          @click="bulkTranslate"
        >
          <i class="bi bi-translate me-1"></i>
          Translate Selected ({{ selectedIds.length }})
        </button>
        <button
          class="btn btn-secondary-custom btn-sm"
          :disabled="selectedIds.length === 0"
          @click="bulkExportSelected"
        >
          <i class="bi bi-download me-1"></i>Export Selected
        </button>
        <button
          class="btn btn-outline-danger btn-sm"
          :disabled="selectedIds.length === 0"
          @click="showDeleteConfirm = true"
        >
          <i class="bi bi-trash me-1"></i>Delete ({{ selectedIds.length }})
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="promptStore.totalPrompts === 0" class="card-custom">
      <div class="empty-state">
        <i class="bi bi-table d-block"></i>
        <h5>No Prompts Loaded</h5>
        <p>Upload a file to see your prompts here</p>
        <router-link to="/upload" class="btn btn-primary-custom mt-3">
          <i class="bi bi-cloud-upload me-2"></i>Upload File
        </router-link>
      </div>
    </div>

    <!-- Table content -->
    <div v-else>
      <!-- Filters & Search -->
      <div class="card-custom mb-3">
        <div class="card-body py-3">
          <div class="row g-2 align-items-end">
            <div class="col-md-4">
              <label class="form-label-custom">Search</label>
              <div class="position-relative">
                <i class="bi bi-search position-absolute" style="left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                <input
                  type="text"
                  class="form-control form-control-custom"
                  style="padding-left: 36px;"
                  placeholder="Search prompts..."
                  :value="promptStore.searchQuery"
                  @input="handleSearch($event.target.value)"
                />
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label-custom">Category</label>
              <select
                class="form-select form-select-custom"
                v-model="promptStore.filterCategory"
              >
                <option value="">All Categories</option>
                <option v-for="cat in promptStore.categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label-custom">Status</label>
              <select
                class="form-select form-select-custom"
                v-model="promptStore.filterStatus"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="translating">Translating</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label-custom">Per Page</label>
              <select
                class="form-select form-select-custom"
                v-model.number="promptStore.pageSize"
              >
                <option v-for="size in pageSizeOptions" :key="size" :value="size">
                  {{ size }} rows
                </option>
              </select>
            </div>
            <div class="col-md-1 d-flex align-items-end">
              <button
                class="btn btn-secondary-custom btn-sm w-100"
                @click="clearFilters"
                title="Clear filters"
              >
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results info -->
      <div class="d-flex justify-content-between align-items-center mb-2" style="font-size: 0.8rem;">
        <span class="text-muted">
          Showing {{ showingRange }} of {{ promptStore.filteredPrompts.length }} prompts
        </span>
        <div class="d-flex align-items-center gap-2">
          <input
            type="checkbox"
            class="form-check-input"
            :checked="allSelected"
            @change="toggleSelectAll"
            id="selectAllTop"
          />
          <label for="selectAllTop" class="text-muted cursor-pointer">Select all on page</label>
        </div>
      </div>

      <!-- Table -->
      <div class="table-custom">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="width: 40px;">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="allSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th @click="promptStore.setSort('globalOrder')" style="width: 60px;"
                  :class="{ active: promptStore.sortField === 'globalOrder' }">
                  SN
                  <i v-if="promptStore.sortField === 'globalOrder'"
                    :class="promptStore.sortDirection === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
                    style="font-size: 0.6rem;"></i>
                </th>
                <th @click="promptStore.setSort('promptNo')" style="width: 80px;"
                  :class="{ active: promptStore.sortField === 'promptNo' }">
                  Prompt No
                  <i v-if="promptStore.sortField === 'promptNo'"
                    :class="promptStore.sortDirection === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
                    style="font-size: 0.6rem;"></i>
                </th>
                <th @click="promptStore.setSort('category')"
                  :class="{ active: promptStore.sortField === 'category' }">
                  Category
                  <i v-if="promptStore.sortField === 'category'"
                    :class="promptStore.sortDirection === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
                    style="font-size: 0.6rem;"></i>
                </th>
                <th>Original Prompt</th>
                <th>Sinhala Translation</th>
                <th style="width: 100px;">Date</th>
                <th style="width: 100px;">Status</th>
                <th style="width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(prompt, index) in promptStore.paginatedPrompts" :key="prompt.id">
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="selectedIds.includes(prompt.id)"
                    @change="toggleSelect(prompt.id)"
                  />
                </td>
                <td>
                  <span class="fw-semibold text-muted">{{ (promptStore.currentPage - 1) * promptStore.pageSize + index + 1 }}</span>
                </td>
                <td>
                  <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary px-2">
                    {{ prompt.promptNo }}
                  </span>
                </td>
                <td>
                  <span class="fw-semibold" style="font-size: 0.8rem;">{{ prompt.category }}</span>
                </td>
                <td>
                  <div class="truncate" style="max-width: 250px;" :title="prompt.originalText">
                    {{ prompt.originalText }}
                  </div>
                </td>
                <td>
                  <!-- Editable translation cell -->
                  <div
                    v-if="editingId !== prompt.id"
                    class="editable-cell"
                    @dblclick="startEditing(prompt)"
                    :title="prompt.sinhalaTranslation ? 'Double-click to edit' : 'No translation yet'"
                  >
                    <span v-if="prompt.sinhalaTranslation" style="font-size: 0.85rem;">
                      {{ truncateText(prompt.sinhalaTranslation, 80) }}
                    </span>
                    <span v-else class="text-muted fst-italic" style="font-size: 0.8rem;">
                      —
                    </span>
                  </div>
                  <div v-else class="editable-cell">
                    <textarea
                      ref="editTextarea"
                      v-model="editValue"
                      @blur="saveEdit(prompt.id)"
                      @keydown.enter.ctrl="saveEdit(prompt.id)"
                      @keydown.escape="cancelEdit"
                      rows="3"
                    ></textarea>
                  </div>
                </td>
                <td>
                  <small class="text-muted">{{ formatShortDate(prompt.translatedAt) }}</small>
                </td>
                <td>
                  <span class="badge-status" :class="'badge-' + prompt.status">
                    {{ prompt.status }}
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button
                      class="btn-icon"
                      style="width: 30px; height: 30px;"
                      @click="translateSingle(prompt.id)"
                      title="Translate"
                      :disabled="translationStore.isTranslating"
                    >
                      <i class="bi bi-translate" style="font-size: 0.75rem;"></i>
                    </button>
                    <button
                      class="btn-icon"
                      style="width: 30px; height: 30px;"
                      @click="copyPrompt(prompt)"
                      title="Copy translation"
                    >
                      <i class="bi bi-clipboard" style="font-size: 0.75rem;"></i>
                    </button>
                    <button
                      class="btn-icon"
                      style="width: 30px; height: 30px;"
                      @click="deleteSingle(prompt.id)"
                      title="Delete"
                    >
                      <i class="bi bi-trash" style="font-size: 0.75rem;"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
        <small class="text-muted">
          Page {{ promptStore.currentPage }} of {{ promptStore.totalPages }}
        </small>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: promptStore.currentPage === 1 }">
              <button class="page-link" @click="promptStore.setPage(1)">
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: promptStore.currentPage === 1 }">
              <button class="page-link" @click="promptStore.setPage(promptStore.currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>

            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === promptStore.currentPage }"
            >
              <button class="page-link" @click="promptStore.setPage(page)">{{ page }}</button>
            </li>

            <li class="page-item" :class="{ disabled: promptStore.currentPage === promptStore.totalPages }">
              <button class="page-link" @click="promptStore.setPage(promptStore.currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: promptStore.currentPage === promptStore.totalPages }">
              <button class="page-link" @click="promptStore.setPage(promptStore.totalPages)">
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Delete confirmation -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Delete Selected Prompts"
      :message="`Are you sure you want to delete ${selectedIds.length} selected prompt(s)? This action cannot be undone.`"
      confirm-text="Delete"
      variant="danger"
      @confirm="deleteSelected"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { useTranslationStore } from '@/stores/translationStore'
import { useLogStore } from '@/stores/logStore'
import { PAGINATION } from '@/config/constants'
import { truncateText, formatShortDate, copyToClipboard, debounce } from '@/utils/helpers'
import NotificationService from '@/services/NotificationService'
import ExportExcelService from '@/services/ExportExcelService'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const promptStore = usePromptStore()
const translationStore = useTranslationStore()
const logStore = useLogStore()

const pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS
const selectedIds = ref([])
const showDeleteConfirm = ref(false)
const editingId = ref(null)
const editValue = ref('')
const editTextarea = ref(null)

/** Debounced search */
const handleSearch = debounce((query) => {
  promptStore.setSearch(query)
}, 300)

/** Showing range text */
const showingRange = computed(() => {
  const start = (promptStore.currentPage - 1) * promptStore.pageSize + 1
  const end = Math.min(start + promptStore.pageSize - 1, promptStore.filteredPrompts.length)
  return `${start}–${end}`
})

/** Visible pagination pages */
const visiblePages = computed(() => {
  const total = promptStore.totalPages
  const current = promptStore.currentPage
  const pages = []
  const maxVisible = 5

  let startPage = Math.max(1, current - Math.floor(maxVisible / 2))
  let endPage = Math.min(total, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

/** Select all on current page */
const allSelected = computed(() => {
  const pageIds = promptStore.paginatedPrompts.map(p => p.id)
  return pageIds.length > 0 && pageIds.every(id => selectedIds.value.includes(id))
})

function toggleSelectAll() {
  const pageIds = promptStore.paginatedPrompts.map(p => p.id)
  if (allSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !pageIds.includes(id))
  } else {
    const newIds = pageIds.filter(id => !selectedIds.value.includes(id))
    selectedIds.value = [...selectedIds.value, ...newIds]
  }
}

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

/** Clear all filters */
function clearFilters() {
  promptStore.setSearch('')
  promptStore.filterCategory = ''
  promptStore.filterStatus = ''
}

/** Inline editing */
function startEditing(prompt) {
  editingId.value = prompt.id
  editValue.value = prompt.sinhalaTranslation || ''
  nextTick(() => {
    const el = editTextarea.value
    if (Array.isArray(el) && el[0]) el[0].focus()
    else if (el) el.focus()
  })
}

function saveEdit(promptId) {
  if (editingId.value === promptId) {
    promptStore.updatePrompt(promptId, {
      sinhalaTranslation: editValue.value
    })
    if (editValue.value.trim()) {
      promptStore.updatePrompt(promptId, {
        sinhalaTranslation: editValue.value,
        status: 'completed',
        translatedAt: new Date().toISOString()
      })
    }
    promptStore.saveToStorage()
    editingId.value = null
    editValue.value = ''
  }
}

function cancelEdit() {
  editingId.value = null
  editValue.value = ''
}

/** Actions */
async function translateSingle(promptId) {
  await translationStore.translateSingle(promptId)
  promptStore.saveToStorage()
}

async function copyPrompt(prompt) {
  const text = prompt.sinhalaTranslation || prompt.originalText
  const success = await copyToClipboard(text)
  if (success) NotificationService.success('Copied to clipboard!')
}

function deleteSingle(promptId) {
  promptStore.deletePrompt(promptId)
  selectedIds.value = selectedIds.value.filter(id => id !== promptId)
  NotificationService.info('Prompt deleted')
}

function deleteSelected() {
  selectedIds.value.forEach(id => promptStore.deletePrompt(id))
  selectedIds.value = []
  showDeleteConfirm.value = false
  promptStore.saveToStorage()
  NotificationService.success('Selected prompts deleted')
}

async function bulkTranslate() {
  if (selectedIds.value.length === 0) return
  await translationStore.translateBatch(selectedIds.value)
  selectedIds.value = []
}

async function bulkExportSelected() {
  const selected = promptStore.prompts.filter(p => selectedIds.value.includes(p.id))
  const categories = [...new Set(selected.map(p => p.category))]
  await ExportExcelService.exportToExcel(selected, categories, {
    filename: 'Selected_Prompts_Export'
  })
  NotificationService.success('Selected prompts exported!')
}
</script>

<template>
  <div class="animate-fade-in-up">
    <!-- Page header -->
    <div class="page-header">
      <h2>Translation</h2>
      <p>Translate your English prompts into Sinhala using Gemini AI</p>
    </div>

    <!-- No prompts warning -->
    <div v-if="promptStore.totalPrompts === 0" class="card-custom">
      <div class="empty-state">
        <i class="bi bi-translate d-block"></i>
        <h5>No Prompts Available</h5>
        <p>Upload prompts first before starting translation</p>
        <router-link to="/upload" class="btn btn-primary-custom mt-3">
          <i class="bi bi-cloud-upload me-2"></i>Upload Prompts
        </router-link>
      </div>
    </div>

    <!-- No API key warning -->
    <div v-else-if="!settingsStore.hasApiKey" class="card-custom">
      <div class="empty-state">
        <i class="bi bi-key d-block text-warning"></i>
        <h5>API Key Required</h5>
        <p>Configure your Gemini API key in Settings to start translating</p>
        <router-link to="/settings" class="btn btn-primary-custom mt-3">
          <i class="bi bi-gear me-2"></i>Go to Settings
        </router-link>
      </div>
    </div>

    <!-- Translation controls -->
    <div v-else>
      <div class="row g-4">
        <!-- Left: Controls -->
        <div class="col-lg-8">
          <!-- Control buttons -->
          <div class="card-custom mb-3">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-sliders me-2 text-primary"></i>Translation Controls
              </h6>

              <div class="d-flex flex-wrap gap-2 mb-3">
                <!-- Translate All -->
                <button
                  class="btn btn-primary-custom"
                  :disabled="translationStore.isTranslating || promptStore.pendingCount === 0"
                  @click="startTranslation"
                >
                  <i class="bi bi-play-fill me-1"></i>
                  Translate All ({{ promptStore.pendingCount + promptStore.failedCount }})
                </button>

                <!-- Pause -->
                <button
                  class="btn btn-warning"
                  :disabled="!translationStore.isTranslating || translationStore.isPaused"
                  @click="translationStore.pause()"
                >
                  <i class="bi bi-pause-fill me-1"></i>Pause
                </button>

                <!-- Resume -->
                <button
                  class="btn btn-success"
                  :disabled="!translationStore.isPaused"
                  @click="translationStore.resume()"
                >
                  <i class="bi bi-play-fill me-1"></i>Resume
                </button>

                <!-- Stop -->
                <button
                  class="btn btn-danger"
                  :disabled="!translationStore.isTranslating"
                  @click="translationStore.stop()"
                >
                  <i class="bi bi-stop-fill me-1"></i>Stop
                </button>

                <!-- Retry Failed -->
                <button
                  class="btn btn-secondary-custom"
                  :disabled="translationStore.isTranslating || promptStore.failedCount === 0"
                  @click="retryFailed"
                >
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Retry Failed ({{ promptStore.failedCount }})
                </button>
              </div>

              <!-- Translation settings inline -->
              <div class="row g-2">
                <div class="col-md-4">
                  <label class="form-label-custom">Batch Size</label>
                  <input
                    type="number"
                    class="form-control form-control-custom form-control-sm"
                    v-model.number="settingsStore.batchSize"
                    :min="1"
                    :max="50"
                    @change="settingsStore.saveToStorage()"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label-custom">Delay (ms)</label>
                  <input
                    type="number"
                    class="form-control form-control-custom form-control-sm"
                    v-model.number="settingsStore.delayBetweenRequests"
                    :min="500"
                    :max="30000"
                    :step="500"
                    @change="settingsStore.saveToStorage()"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label-custom">Model</label>
                  <select
                    class="form-select form-select-custom form-select-sm"
                    v-model="settingsStore.model"
                    @change="settingsStore.saveToStorage()"
                  >
                    <option v-for="m in GEMINI_MODELS" :key="m.id" :value="m.id">
                      {{ m.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Active translation progress -->
          <div v-if="translationStore.isTranslating || translationStore.completedInSession > 0" class="card-custom mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0">
                  <i class="bi bi-activity me-2"></i>
                  {{ translationStore.isTranslating ? 'Translation in Progress' : 'Session Complete' }}
                </h6>
                <div v-if="translationStore.isTranslating" class="d-flex align-items-center gap-2">
                  <div class="spinner-custom sm"></div>
                  <span
                    v-if="translationStore.isPaused"
                    class="badge bg-warning text-dark"
                  >Paused</span>
                </div>
              </div>

              <!-- Batch progress -->
              <ProgressBar
                :percentage="batchPercentage"
                :label="`Batch Progress — ${translationStore.currentBatchIndex} / ${translationStore.totalInBatch}`"
                :large="true"
                :variant="batchPercentage === 100 ? 'success' : ''"
              />

              <!-- Current prompt info -->
              <div v-if="currentPrompt" class="mt-3 p-3 rounded-3" style="background: var(--bg-tertiary);">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <small class="text-muted d-block mb-1">Currently Translating</small>
                    <div class="fw-semibold" style="font-size: 0.9rem;">
                      <span class="badge bg-primary bg-opacity-10 text-primary me-2">
                        #{{ currentPrompt.promptNo }}
                      </span>
                      {{ currentPrompt.category }}
                    </div>
                    <p class="mb-0 mt-1 text-muted" style="font-size: 0.8rem;">
                      {{ truncateText(currentPrompt.originalText, 120) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Stats row -->
              <div class="row mt-3 text-center" style="font-size: 0.8rem;">
                <div class="col-3">
                  <div class="fw-bold text-success">{{ translationStore.completedInSession }}</div>
                  <div class="text-muted">Translated</div>
                </div>
                <div class="col-3">
                  <div class="fw-bold text-primary">{{ elapsedFormatted }}</div>
                  <div class="text-muted">Elapsed</div>
                </div>
                <div class="col-3">
                  <div class="fw-bold text-warning">{{ eta }}</div>
                  <div class="text-muted">ETA</div>
                </div>
                <div class="col-3">
                  <div class="fw-bold text-info">{{ translationStore.currentCategory || '—' }}</div>
                  <div class="text-muted">Category</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Overall progress -->
          <div class="card-custom">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-graph-up me-2 text-primary"></i>Overall Progress
              </h6>
              <ProgressBar
                :percentage="promptStore.progressPercentage"
                label="Total Translation Progress"
                :large="true"
                :variant="promptStore.progressPercentage === 100 ? 'success' : ''"
              />
              <div class="row mt-3">
                <div class="col-4 text-center">
                  <h5 class="text-success fw-bold mb-0">{{ promptStore.translatedCount }}</h5>
                  <small class="text-muted">Completed</small>
                </div>
                <div class="col-4 text-center">
                  <h5 class="text-warning fw-bold mb-0">{{ promptStore.pendingCount }}</h5>
                  <small class="text-muted">Pending</small>
                </div>
                <div class="col-4 text-center">
                  <h5 class="text-danger fw-bold mb-0">{{ promptStore.failedCount }}</h5>
                  <small class="text-muted">Failed</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Status panel -->
        <div class="col-lg-4">
          <!-- Queue info -->
          <div class="card-custom mb-3">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-list-check me-2 text-info"></i>Queue Status
              </h6>
              <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
                <span class="text-muted">Total in queue</span>
                <span class="fw-bold">{{ translationStore.queue.length }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
                <span class="text-muted">Batch position</span>
                <span class="fw-bold">{{ translationStore.currentBatchIndex }} / {{ translationStore.totalInBatch }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
                <span class="text-muted">Session completed</span>
                <span class="fw-bold text-success">{{ translationStore.completedInSession }}</span>
              </div>
              <div class="d-flex justify-content-between" style="font-size: 0.85rem;">
                <span class="text-muted">Status</span>
                <span class="fw-bold" :class="{
                  'text-success': translationStore.isTranslating && !translationStore.isPaused,
                  'text-warning': translationStore.isPaused,
                  'text-muted': !translationStore.isTranslating
                }">
                  {{ translationStore.isPaused ? 'Paused' : translationStore.isTranslating ? 'Running' : 'Idle' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Category progress -->
          <div class="card-custom mb-3">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-folder2-open me-2 text-primary"></i>Category Progress
              </h6>
              <div v-if="categoryProgress.length === 0" class="text-muted text-center py-3" style="font-size: 0.85rem;">
                No categories available
              </div>
              <div v-else style="max-height: 300px; overflow-y: auto;">
                <div
                  v-for="cat in categoryProgress"
                  :key="cat.name"
                  class="mb-3"
                >
                  <div class="d-flex justify-content-between mb-1" style="font-size: 0.8rem;">
                    <span class="fw-semibold truncate" style="max-width: 160px;">{{ cat.name }}</span>
                    <span class="text-muted">{{ cat.completed }}/{{ cat.total }}</span>
                  </div>
                  <ProgressBar
                    :percentage="cat.percentage"
                    :show-label="false"
                    :variant="cat.percentage === 100 ? 'success' : ''"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div class="card-custom">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-lightbulb me-2 text-warning"></i>Tips
              </h6>
              <ul class="list-unstyled mb-0" style="font-size: 0.8rem; color: var(--text-secondary);">
                <li class="mb-2 d-flex gap-2">
                  <i class="bi bi-dot fs-4 text-primary" style="line-height: 1;"></i>
                  <span>Use 1500ms+ delay to avoid rate limits</span>
                </li>
                <li class="mb-2 d-flex gap-2">
                  <i class="bi bi-dot fs-4 text-primary" style="line-height: 1;"></i>
                  <span>Flash Lite is fastest for batch translation</span>
                </li>
                <li class="mb-2 d-flex gap-2">
                  <i class="bi bi-dot fs-4 text-primary" style="line-height: 1;"></i>
                  <span>Progress saves every 5 prompts automatically</span>
                </li>
                <li class="d-flex gap-2">
                  <i class="bi bi-dot fs-4 text-primary" style="line-height: 1;"></i>
                  <span>You can pause and resume any time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTranslationStore } from '@/stores/translationStore'
import { useTranslation } from '@/composables/useTranslation'
import { GEMINI_MODELS, TRANSLATION_STATUS } from '@/config/constants'
import { truncateText, calculatePercentage } from '@/utils/helpers'
import ProgressBar from '@/components/common/ProgressBar.vue'

const promptStore = usePromptStore()
const settingsStore = useSettingsStore()
const translationStore = useTranslationStore()
const { currentPrompt, batchPercentage, eta, elapsedFormatted } = useTranslation()

/** Category progress list */
const categoryProgress = computed(() => {
  return promptStore.categories.map(catName => {
    const catPrompts = promptStore.prompts.filter(p => p.category === catName)
    const completed = catPrompts.filter(p => p.status === TRANSLATION_STATUS.COMPLETED).length
    return {
      name: catName,
      total: catPrompts.length,
      completed,
      percentage: calculatePercentage(completed, catPrompts.length)
    }
  }).sort((a, b) => a.percentage - b.percentage)
})

/** Start batch translation */
async function startTranslation() {
  await translationStore.translateBatch()
}

/** Retry failed translations */
async function retryFailed() {
  await translationStore.retryFailed()
}
</script>

<template>
  <div class="animate-fade-in-up">
    <!-- Page header -->
    <div class="page-header">
      <h2>Settings</h2>
      <p>Configure your Gemini API key and translation settings</p>
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <!-- API Key -->
        <div class="card-custom mb-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-key me-2 text-warning"></i>Gemini API Key
            </h6>
            <div class="mb-3">
              <label class="form-label-custom">API Key</label>
              <div class="input-group">
                <input
                  :type="showApiKey ? 'text' : 'password'"
                  class="form-control form-control-custom"
                  v-model="localApiKey"
                  placeholder="Enter your Gemini API key"
                />
                <button
                  class="btn btn-secondary-custom"
                  @click="showApiKey = !showApiKey"
                  style="border-radius: 0;"
                >
                  <i :class="showApiKey ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
                <button
                  class="btn btn-primary-custom"
                  @click="saveApiKey"
                  style="border-top-left-radius: 0; border-bottom-left-radius: 0;"
                >
                  <i class="bi bi-save me-1"></i>Save
                </button>
              </div>
              <small class="text-muted mt-1 d-block">
                Get your API key from
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">
                  Google AI Studio <i class="bi bi-box-arrow-up-right" style="font-size: 0.7rem;"></i>
                </a>
              </small>
            </div>

            <!-- Test connection -->
            <button
              class="btn btn-secondary-custom"
              :disabled="!localApiKey || isTesting"
              @click="testConnection"
            >
              <span v-if="isTesting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-plug me-1"></i>
              {{ isTesting ? 'Testing...' : 'Test Connection' }}
            </button>

            <div v-if="testResult" class="mt-3 animate-fade-in">
              <div
                class="alert d-flex align-items-center gap-2"
                :class="testResult.success ? 'alert-success' : 'alert-danger'"
                style="border-radius: 10px;"
              >
                <i :class="testResult.success ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
                {{ testResult.message }}
              </div>
            </div>
          </div>
        </div>

        <!-- Model selection -->
        <div class="card-custom mb-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-cpu me-2 text-primary"></i>Model Selection
            </h6>
            <div class="row g-3">
              <div class="col-12">
                <div class="d-flex flex-column gap-2">
                  <div
                    v-for="model in GEMINI_MODELS"
                    :key="model.id"
                    class="p-3 rounded-3 cursor-pointer d-flex align-items-center gap-3"
                    :class="{
                      'border border-primary': settingsStore.model === model.id
                    }"
                    :style="{
                      background: settingsStore.model === model.id ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                      borderWidth: settingsStore.model === model.id ? '2px' : '1px'
                    }"
                    @click="selectModel(model.id)"
                  >
                    <div class="form-check mb-0">
                      <input
                        class="form-check-input"
                        type="radio"
                        :id="'model-' + model.id"
                        :value="model.id"
                        v-model="settingsStore.model"
                        @change="settingsStore.saveToStorage()"
                      />
                    </div>
                    <div>
                      <div class="fw-bold" style="font-size: 0.9rem;">{{ model.name }}</div>
                      <small class="text-muted">{{ model.description }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Generation parameters -->
        <div class="card-custom mb-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-sliders me-2 text-info"></i>Generation Parameters
            </h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label-custom">
                  Temperature
                  <span class="text-primary fw-bold ms-1">{{ settingsStore.temperature }}</span>
                </label>
                <input
                  type="range"
                  class="form-range"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  v-model.number="settingsStore.temperature"
                  @change="settingsStore.saveToStorage()"
                />
                <small class="text-muted">Lower = more deterministic, Higher = more creative</small>
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">
                  Top P
                  <span class="text-primary fw-bold ms-1">{{ settingsStore.topP }}</span>
                </label>
                <input
                  type="range"
                  class="form-range"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  v-model.number="settingsStore.topP"
                  @change="settingsStore.saveToStorage()"
                />
                <small class="text-muted">Controls diversity via nucleus sampling</small>
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Top K</label>
                <input
                  type="number"
                  class="form-control form-control-custom"
                  v-model.number="settingsStore.topK"
                  :min="1"
                  :max="100"
                  @change="settingsStore.saveToStorage()"
                />
                <small class="text-muted">Number of top tokens to consider</small>
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Max Output Tokens</label>
                <input
                  type="number"
                  class="form-control form-control-custom"
                  v-model.number="settingsStore.maxOutputTokens"
                  :min="100"
                  :max="8192"
                  :step="256"
                  @change="settingsStore.saveToStorage()"
                />
                <small class="text-muted">Maximum tokens in the response</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Translation settings -->
        <div class="card-custom mb-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-speedometer2 me-2 text-success"></i>Translation Settings
            </h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label-custom">Batch Size</label>
                <input
                  type="number"
                  class="form-control form-control-custom"
                  v-model.number="settingsStore.batchSize"
                  :min="1"
                  :max="50"
                  @change="settingsStore.saveToStorage()"
                />
                <small class="text-muted">Number of prompts per batch</small>
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Delay Between Requests (ms)</label>
                <input
                  type="number"
                  class="form-control form-control-custom"
                  v-model.number="settingsStore.delayBetweenRequests"
                  :min="500"
                  :max="30000"
                  :step="500"
                  @change="settingsStore.saveToStorage()"
                />
                <small class="text-muted">Delay to avoid rate limiting</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Reset -->
        <div class="card-custom">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-arrow-counterclockwise me-2 text-danger"></i>Reset
            </h6>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-outline-warning btn-sm" @click="resetSettings">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Settings to Default
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="showClearAllConfirm = true">
                <i class="bi bi-trash me-1"></i>Clear All Storage
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Info panel -->
      <div class="col-lg-4">
        <!-- Connection status -->
        <div class="card-custom mb-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-plug me-2"></i>Connection Status
            </h6>
            <div class="d-flex align-items-center gap-3 p-3 rounded-3" style="background: var(--bg-tertiary);">
              <div
                class="rounded-circle"
                :style="{
                  width: '12px',
                  height: '12px',
                  background: settingsStore.hasApiKey ? 'var(--accent-success)' : 'var(--accent-danger)'
                }"
              ></div>
              <div>
                <div class="fw-semibold" style="font-size: 0.9rem;">
                  {{ settingsStore.hasApiKey ? 'API Key Configured' : 'No API Key' }}
                </div>
                <small class="text-muted">
                  Model: {{ settingsStore.model }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme -->
        <div class="card-custom mb-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-palette me-2 text-primary"></i>Appearance
            </h6>
            <div class="d-flex gap-2">
              <button
                class="btn flex-fill"
                :class="settingsStore.theme === 'light' ? 'btn-primary-custom' : 'btn-secondary-custom'"
                @click="settingsStore.setTheme('light')"
              >
                <i class="bi bi-sun me-1"></i>Light
              </button>
              <button
                class="btn flex-fill"
                :class="settingsStore.theme === 'dark' ? 'btn-primary-custom' : 'btn-secondary-custom'"
                @click="settingsStore.setTheme('dark')"
              >
                <i class="bi bi-moon me-1"></i>Dark
              </button>
            </div>
          </div>
        </div>

        <!-- Storage info -->
        <div class="card-custom">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-hdd me-2 text-info"></i>Storage Usage
            </h6>
            <div class="d-flex justify-content-between mb-2" style="font-size: 0.85rem;">
              <span class="text-muted">Used</span>
              <span class="fw-bold">{{ storageSize }}</span>
            </div>
            <ProgressBar
              :percentage="storagePercent"
              :show-label="false"
              :variant="storagePercent > 80 ? 'danger' : storagePercent > 50 ? 'warning' : ''"
            />
            <small class="text-muted mt-2 d-block">
              LocalStorage limit: ~5 MB
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear all confirmation -->
    <ConfirmDialog
      :show="showClearAllConfirm"
      title="Clear All Storage"
      message="This will delete all saved data including prompts, translations, settings, and logs. This cannot be undone."
      confirm-text="Clear Everything"
      variant="danger"
      @confirm="clearAllStorage"
      @cancel="showClearAllConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { usePromptStore } from '@/stores/promptStore'
import { useLogStore } from '@/stores/logStore'
import { GEMINI_MODELS } from '@/config/constants'
import GeminiService from '@/services/GeminiService'
import StorageService from '@/services/StorageService'
import NotificationService from '@/services/NotificationService'
import ProgressBar from '@/components/common/ProgressBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const settingsStore = useSettingsStore()
const promptStore = usePromptStore()
const logStore = useLogStore()

/** Refs */
const localApiKey = ref('')
const showApiKey = ref(false)
const isTesting = ref(false)
const testResult = ref(null)
const showClearAllConfirm = ref(false)

/** Load API key on mount */
onMounted(() => {
  localApiKey.value = settingsStore.apiKey
})

/** Storage info */
const storageSize = computed(() => StorageService.getFormattedStorageSize())
const storagePercent = computed(() => {
  const bytes = StorageService.getStorageSize()
  return Math.min(100, (bytes / (5 * 1024 * 1024)) * 100)
})

/** Save API key */
function saveApiKey() {
  settingsStore.setApiKey(localApiKey.value.trim())
  NotificationService.success('API key saved!')
  logStore.addLog('info', 'API key updated')
  testResult.value = null
}

/** Select a model */
function selectModel(modelId) {
  settingsStore.model = modelId
  settingsStore.saveToStorage()
}

/** Test API connection */
async function testConnection() {
  isTesting.value = true
  testResult.value = null

  const result = await GeminiService.testConnection(
    localApiKey.value.trim(),
    settingsStore.model
  )

  testResult.value = result
  isTesting.value = false

  if (result.success) {
    NotificationService.success('API connection successful!')
    logStore.addLog('success', `API test passed with model "${settingsStore.model}"`)
  } else {
    NotificationService.error(result.message)
    logStore.addLog('error', `API test failed: ${result.message}`)
  }
}

/** Reset settings to defaults */
function resetSettings() {
  settingsStore.resetToDefaults()
  NotificationService.info('Settings reset to defaults')
  logStore.addLog('info', 'Settings reset to defaults')
}

/** Clear all storage */
function clearAllStorage() {
  StorageService.clearAll()
  promptStore.clearAllPrompts()
  logStore.clearLogs()
  settingsStore.resetToDefaults()
  localApiKey.value = ''
  showClearAllConfirm.value = false
  NotificationService.success('All storage cleared')
}
</script>

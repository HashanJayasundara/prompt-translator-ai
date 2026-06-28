/**
 * Translation Store — Manages the translation queue, batch processing, pause/resume/stop
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TRANSLATION_STATUS } from '@/config/constants'
import { usePromptStore } from '@/stores/promptStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useLogStore } from '@/stores/logStore'
import GeminiService from '@/services/GeminiService'
import { delay } from '@/utils/helpers'

export const useTranslationStore = defineStore('translation', () => {
  /** State */
  const isTranslating = ref(false)
  const isPaused = ref(false)
  const isStopped = ref(false)
  const currentPromptId = ref(null)
  const currentCategory = ref('')
  const currentBatchIndex = ref(0)
  const totalInBatch = ref(0)
  const startTime = ref(null)
  const completedInSession = ref(0)
  const abortController = ref(null)
  const queue = ref([])

  /** Computed */
  const elapsedTime = computed(() => {
    if (!startTime.value) return 0
    return Date.now() - startTime.value
  })

  const isActive = computed(() => isTranslating.value && !isPaused.value && !isStopped.value)

  /** Actions */

  /**
   * Translate a single prompt by ID
   * @param {string} promptId - ID of the prompt to translate
   */
  async function translateSingle(promptId) {
    const promptStore = usePromptStore()
    const settingsStore = useSettingsStore()
    const logStore = useLogStore()

    if (!settingsStore.hasApiKey) {
      logStore.addLog('error', 'API key is not configured. Go to Settings to add your Gemini API key.')
      return
    }

    const prompt = promptStore.prompts.find(p => p.id === promptId)
    if (!prompt) {
      logStore.addLog('error', `Prompt not found: ${promptId}`)
      return
    }

    isTranslating.value = true
    currentPromptId.value = promptId
    currentCategory.value = prompt.category
    startTime.value = Date.now()

    abortController.value = new AbortController()

    promptStore.setTranslating(promptId)
    logStore.addLog('info', `Translating prompt #${prompt.promptNo} in "${prompt.category}"`)

    const result = await GeminiService.translate(
      prompt.originalText,
      settingsStore.apiKey,
      settingsStore.model,
      settingsStore.generationConfig,
      abortController.value.signal
    )

    if (result.success) {
      promptStore.setTranslation(promptId, result.translation)
      promptStore.saveToStorage()
      completedInSession.value++
      logStore.addLog('success', `Translated prompt #${prompt.promptNo}: "${prompt.originalText.substring(0, 50)}..."`)
    } else {
      promptStore.setTranslationFailed(promptId, result.error)
      logStore.addLog('error', `Failed prompt #${prompt.promptNo}: ${result.error}`)
    }

    isTranslating.value = false
    currentPromptId.value = null
    abortController.value = null
  }

  /**
   * Translate prompts in batch mode
   * @param {Array} promptIds - Array of prompt IDs to translate (or empty for all pending)
   */
  async function translateBatch(promptIds = []) {
    const promptStore = usePromptStore()
    const settingsStore = useSettingsStore()
    const logStore = useLogStore()

    if (!settingsStore.hasApiKey) {
      logStore.addLog('error', 'API key is not configured. Go to Settings to add your Gemini API key.')
      return
    }

    /** Build the queue */
    if (promptIds.length > 0) {
      queue.value = [...promptIds]
    } else {
      /** Get all pending and failed prompts */
      queue.value = promptStore.prompts
        .filter(p => p.status === TRANSLATION_STATUS.PENDING || p.status === TRANSLATION_STATUS.FAILED)
        .map(p => p.id)
    }

    if (queue.value.length === 0) {
      logStore.addLog('info', 'No prompts to translate')
      return
    }

    isTranslating.value = true
    isPaused.value = false
    isStopped.value = false
    startTime.value = Date.now()
    completedInSession.value = 0
    totalInBatch.value = queue.value.length

    logStore.addLog('info', `Starting batch translation of ${queue.value.length} prompts`)

    const batchSize = settingsStore.batchSize
    const delayMs = settingsStore.delayBetweenRequests

    for (let i = 0; i < queue.value.length; i++) {
      /** Check for stop */
      if (isStopped.value) {
        logStore.addLog('warning', 'Translation stopped by user')
        break
      }

      /** Check for pause */
      while (isPaused.value && !isStopped.value) {
        await delay(500)
      }

      if (isStopped.value) break

      const promptId = queue.value[i]
      const prompt = promptStore.prompts.find(p => p.id === promptId)
      if (!prompt) continue

      /** Skip already completed prompts */
      if (prompt.status === TRANSLATION_STATUS.COMPLETED) {
        continue
      }

      currentPromptId.value = promptId
      currentCategory.value = prompt.category
      currentBatchIndex.value = i + 1

      abortController.value = new AbortController()
      promptStore.setTranslating(promptId)

      const result = await GeminiService.translate(
        prompt.originalText,
        settingsStore.apiKey,
        settingsStore.model,
        settingsStore.generationConfig,
        abortController.value.signal
      )

      if (result.success) {
        promptStore.setTranslation(promptId, result.translation)
        completedInSession.value++
        logStore.addLog('success', `[${i + 1}/${queue.value.length}] Translated prompt #${prompt.promptNo}`)
      } else {
        promptStore.setTranslationFailed(promptId, result.error)
        logStore.addLog('error', `[${i + 1}/${queue.value.length}] Failed prompt #${prompt.promptNo}: ${result.error}`)
      }

      /** Save progress periodically (every 5 prompts) */
      if ((i + 1) % 5 === 0) {
        promptStore.saveToStorage()
      }

      /** Rate limiting delay between requests */
      if (i < queue.value.length - 1 && !isStopped.value) {
        await delay(delayMs)
      }
    }

    /** Final save */
    promptStore.saveToStorage()

    isTranslating.value = false
    isPaused.value = false
    currentPromptId.value = null
    currentCategory.value = ''
    abortController.value = null

    logStore.addLog('info', `Batch translation completed. ${completedInSession.value} translated in this session.`)
  }

  /**
   * Retry all failed prompts
   */
  async function retryFailed() {
    const promptStore = usePromptStore()
    const failedIds = promptStore.prompts
      .filter(p => p.status === TRANSLATION_STATUS.FAILED)
      .map(p => p.id)

    if (failedIds.length === 0) return
    await translateBatch(failedIds)
  }

  /**
   * Pause translation
   */
  function pause() {
    isPaused.value = true
    const logStore = useLogStore()
    logStore.addLog('warning', 'Translation paused')
  }

  /**
   * Resume translation
   */
  function resume() {
    isPaused.value = false
    const logStore = useLogStore()
    logStore.addLog('info', 'Translation resumed')
  }

  /**
   * Stop translation completely
   */
  function stop() {
    isStopped.value = true
    isPaused.value = false
    if (abortController.value) {
      abortController.value.abort()
    }
    const logStore = useLogStore()
    logStore.addLog('warning', 'Translation stopped')
  }

  /**
   * Reset the translation state
   */
  function reset() {
    isTranslating.value = false
    isPaused.value = false
    isStopped.value = false
    currentPromptId.value = null
    currentCategory.value = ''
    currentBatchIndex.value = 0
    totalInBatch.value = 0
    startTime.value = null
    completedInSession.value = 0
    queue.value = []
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }

  return {
    /** State */
    isTranslating,
    isPaused,
    isStopped,
    currentPromptId,
    currentCategory,
    currentBatchIndex,
    totalInBatch,
    startTime,
    completedInSession,
    queue,
    /** Computed */
    elapsedTime,
    isActive,
    /** Actions */
    translateSingle,
    translateBatch,
    retryFailed,
    pause,
    resume,
    stop,
    reset
  }
})

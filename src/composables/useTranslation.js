/**
 * useTranslation composable — Provides translation controls and progress tracking
 */
import { computed } from 'vue'
import { useTranslationStore } from '@/stores/translationStore'
import { usePromptStore } from '@/stores/promptStore'
import { estimateRemainingTime, formatDuration } from '@/utils/helpers'

export function useTranslation() {
  const translationStore = useTranslationStore()
  const promptStore = usePromptStore()

  /** Current prompt being translated */
  const currentPrompt = computed(() => {
    if (!translationStore.currentPromptId) return null
    return promptStore.prompts.find(p => p.id === translationStore.currentPromptId)
  })

  /** Batch progress text */
  const batchProgressText = computed(() => {
    if (!translationStore.isTranslating) return ''
    return `${translationStore.currentBatchIndex} / ${translationStore.totalInBatch}`
  })

  /** ETA for completion */
  const eta = computed(() => {
    if (!translationStore.isTranslating || translationStore.completedInSession === 0) {
      return 'Calculating...'
    }
    const remaining = translationStore.totalInBatch - translationStore.currentBatchIndex
    return estimateRemainingTime(
      translationStore.completedInSession,
      translationStore.completedInSession + remaining,
      translationStore.elapsedTime
    )
  })

  /** Elapsed time formatted */
  const elapsedFormatted = computed(() => {
    return formatDuration(translationStore.elapsedTime)
  })

  /** Batch progress percentage */
  const batchPercentage = computed(() => {
    if (translationStore.totalInBatch === 0) return 0
    return parseFloat(((translationStore.currentBatchIndex / translationStore.totalInBatch) * 100).toFixed(1))
  })

  return {
    currentPrompt,
    batchProgressText,
    eta,
    elapsedFormatted,
    batchPercentage
  }
}

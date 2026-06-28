/**
 * GeminiService — Handles all interactions with the Google Gemini API
 */
import axios from 'axios'
import { TRANSLATION_PROMPT } from '@/config/constants'

class GeminiService {
  constructor() {
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'
  }

  /**
   * Build the full API endpoint URL
   * @param {string} model - Gemini model ID
   * @param {string} apiKey - API key
   * @returns {string} Full endpoint URL
   */
  _buildUrl(model, apiKey) {
    return `${this.baseUrl}/${model}:generateContent?key=${apiKey}`
  }

  /**
   * Build the request payload for Gemini API
   * @param {string} promptText - The text to translate
   * @param {Object} settings - Generation settings
   * @returns {Object} Request payload
   */
  _buildPayload(promptText, settings) {
    return {
      contents: [
        {
          parts: [
            {
              text: `${TRANSLATION_PROMPT}${promptText}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: settings.temperature ?? 0.3,
        topP: settings.topP ?? 0.95,
        topK: settings.topK ?? 40,
        maxOutputTokens: settings.maxOutputTokens ?? 2048
      }
    }
  }

  /**
   * Translate a single prompt text to Sinhala
   * @param {string} promptText - English prompt to translate
   * @param {string} apiKey - Gemini API key
   * @param {string} model - Gemini model ID
   * @param {Object} settings - Generation settings (temperature, topP, topK, maxOutputTokens)
   * @param {AbortSignal} [signal] - Optional abort signal for cancellation
   * @returns {Promise<{success: boolean, translation: string, error: string|null}>}
   */
  async translate(promptText, apiKey, model, settings, signal = null) {
    try {
      const url = this._buildUrl(model, apiKey)
      const payload = this._buildPayload(promptText, settings)

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
        signal
      })

      /** Extract the translated text from Gemini response */
      const candidates = response.data?.candidates
      if (!candidates || candidates.length === 0) {
        return {
          success: false,
          translation: '',
          error: 'No response candidates from Gemini API'
        }
      }

      const text = candidates[0]?.content?.parts?.[0]?.text
      if (!text) {
        return {
          success: false,
          translation: '',
          error: 'Empty response from Gemini API'
        }
      }

      return {
        success: true,
        translation: text.trim(),
        error: null
      }
    } catch (error) {
      /** Handle cancellation */
      if (axios.isCancel(error) || error.name === 'AbortError') {
        return {
          success: false,
          translation: '',
          error: 'Translation cancelled'
        }
      }

      /** Parse error message from API response */
      const apiError = error.response?.data?.error?.message || error.message || 'Unknown error'
      return {
        success: false,
        translation: '',
        error: apiError
      }
    }
  }

  /**
   * Test the API connection with a simple request
   * @param {string} apiKey - Gemini API key
   * @param {string} model - Gemini model ID
   * @returns {Promise<{success: boolean, message: string, modelInfo: Object|null}>}
   */
  async testConnection(apiKey, model) {
    try {
      const url = this._buildUrl(model, apiKey)
      const payload = {
        contents: [
          {
            parts: [
              {
                text: 'Respond with exactly: CONNECTION_OK'
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 50
        }
      }

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      })

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        return {
          success: true,
          message: `Connection successful! Model "${model}" is responding.`,
          modelInfo: {
            model,
            response: text.trim()
          }
        }
      }

      return {
        success: false,
        message: 'Received empty response from API',
        modelInfo: null
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message
      return {
        success: false,
        message: `Connection failed: ${errorMsg}`,
        modelInfo: null
      }
    }
  }

  /**
   * List available models (for validation)
   * @param {string} apiKey - Gemini API key
   * @returns {Promise<{success: boolean, models: Array}>}
   */
  async listModels(apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      const response = await axios.get(url, { timeout: 15000 })
      const models = response.data?.models || []
      return {
        success: true,
        models: models.map(m => ({
          id: m.name?.replace('models/', ''),
          displayName: m.displayName,
          description: m.description
        }))
      }
    } catch (error) {
      return {
        success: false,
        models: []
      }
    }
  }
}

export default new GeminiService()

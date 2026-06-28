/**
 * Application constants and configuration
 */

/** Available Gemini models */
export const GEMINI_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable model' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Lightweight and fast' }
]

/** Default Gemini generation settings */
export const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  temperature: 0.3,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
  delayBetweenRequests: 1500,
  batchSize: 5,
  theme: 'light'
}

/** Local storage keys */
export const STORAGE_KEYS = {
  API_KEY: 'pt_api_key',
  SETTINGS: 'pt_settings',
  PROMPTS: 'pt_prompts',
  CATEGORIES: 'pt_categories',
  TRANSLATION_PROGRESS: 'pt_translation_progress',
  EXPORT_SETTINGS: 'pt_export_settings',
  THEME: 'pt_theme',
  LOGS: 'pt_logs'
}

/** Translation status constants */
export const TRANSLATION_STATUS = {
  PENDING: 'pending',
  TRANSLATING: 'translating',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
}

/** Supported upload file types */
export const SUPPORTED_FILE_TYPES = {
  TXT: '.txt',
  CSV: '.csv',
  DOCX: '.docx'
}

/** Accepted MIME types for file upload */
export const ACCEPTED_MIME_TYPES = [
  'text/plain',
  'text/csv',
  'application/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100, 250]
}

/** Translation prompt template for Gemini */
export const TRANSLATION_PROMPT = `You are a professional translator. Translate the following English AI image/video prompt into Sinhala language.

STRICT RULES:
1. Translate ONLY descriptive English text into Sinhala.
2. DO NOT translate any of the following — keep them exactly as they are in English:
   - Technical terms: 8K, 4K, HDR, UHD, ultra realistic, cinematic, hyper realistic
   - Camera settings: f/1.4, f/2.8, ISO, shutter speed, bokeh, depth of field
   - Frame rates and timing: 10s, 30fps, 60fps, 24fps
   - Aspect ratios: 16:9, 4:3, 1:1, 9:16, --ar
   - AI-specific keywords: photorealistic, ray tracing, octane render, unreal engine, volumetric lighting, global illumination, subsurface scattering
   - Style keywords: anime, manga, watercolor, oil painting, digital art
   - Quality keywords: masterpiece, best quality, high resolution, detailed
3. Return ONLY the Sinhala translation. No explanations, no notes, no original text.
4. Maintain the natural flow and meaning in Sinhala.
5. If the entire prompt is technical terms only, return them as-is.

English prompt to translate:
`

/** Log entry types */
export const LOG_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
}

/** Export format options */
export const EXPORT_FORMATS = {
  DOCX: 'docx',
  XLSX: 'xlsx',
  PDF: 'pdf'
}

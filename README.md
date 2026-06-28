# Prompt Translator AI

A complete Vue 3 browser-based application that translates hundreds of English AI prompts into Sinhala using the Google Gemini API. Everything runs in the frontend — no backend required.

## Features

- **Dashboard** — Real-time statistics, category breakdown, and progress tracking
- **File Upload** — Drag & drop support for TXT, CSV, and DOCX files
- **Smart Parser** — Auto-detects categories, prompt numbers, and text structure
- **Gemini Translation** — Batch translation with pause/resume/stop controls
- **Prompt Table** — Full CRUD with search, sort, filter, pagination, and inline editing
- **Export** — Generate professional DOCX, XLSX, and PDF with category-wise tables
- **Activity Logs** — Track all translation activity and errors
- **Settings** — API key management, model selection, generation parameters
- **Theme Support** — Light and dark mode with automatic persistence
- **Local Storage** — All data persists across browser sessions

## Tech Stack

- **Vue 3** (Composition API)
- **Vite** (Build tool)
- **Bootstrap 5** (UI framework)
- **Pinia** (State management)
- **Vue Router** (Navigation)
- **Axios** (HTTP client)

## Libraries

| Library | Purpose |
|---------|---------|
| `docx` | Word document generation |
| `xlsx` | Excel spreadsheet generation |
| `jspdf` + `jspdf-autotable` | PDF generation |
| `file-saver` | File download handling |
| `mammoth` | DOCX file reading |
| `vue-toastification` | Toast notifications |
| Bootstrap Icons | Icon set |

## Installation

```bash
# Clone or download the project
cd prompt-translator-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Folder Structure

```
src/
├── assets/
│   └── styles/
│       └── main.css          # Global styles & themes
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.vue # Reusable confirmation modal
│   │   ├── LoadingSpinner.vue# Loading indicator
│   │   ├── ProgressBar.vue   # Progress bar component
│   │   └── StatCard.vue      # Statistics card
│   └── layout/
│       ├── AppFooter.vue     # Application footer
│       ├── Navbar.vue        # Top navigation bar
│       └── Sidebar.vue       # Side navigation
├── composables/
│   ├── useTheme.js           # Theme management
│   └── useTranslation.js    # Translation progress helpers
├── config/
│   └── constants.js          # App constants & configuration
├── router/
│   └── index.js              # Vue Router setup
├── services/
│   ├── ExportExcelService.js # XLSX export
│   ├── ExportPdfService.js   # PDF export
│   ├── ExportWordService.js  # DOCX export
│   ├── GeminiService.js      # Gemini API integration
│   ├── NotificationService.js# Toast notifications
│   ├── ParserService.js      # File parsing (TXT/CSV/DOCX)
│   └── StorageService.js     # LocalStorage management
├── stores/
│   ├── logStore.js           # Activity logs state
│   ├── promptStore.js        # Prompt data state
│   ├── settingsStore.js      # Settings state
│   └── translationStore.js   # Translation queue state
├── utils/
│   └── helpers.js            # Utility functions
├── views/
│   ├── DashboardView.vue     # Dashboard page
│   ├── ExportView.vue        # Export page
│   ├── LogsView.vue          # Activity logs page
│   ├── PromptsView.vue       # Prompt table page
│   ├── SettingsView.vue      # Settings page
│   ├── TranslationView.vue   # Translation control page
│   └── UploadView.vue        # File upload page
├── App.vue                   # Root component
└── main.js                   # Application entry point
```

## Usage

1. **Configure API Key** — Go to Settings and enter your Gemini API key
2. **Upload Prompts** — Upload a TXT, CSV, or DOCX file with your prompts
3. **Review Prompts** — Check the Prompt Table for parsed data
4. **Start Translation** — Go to Translation and click "Translate All"
5. **Export Results** — Export translated prompts as DOCX, XLSX, or PDF

## File Format Examples

### TXT
```
Nature Photography
1. A serene lake reflecting the sunset
2. Mountain peaks covered in fresh snow

Portrait Photography
1. A woman bathed in golden hour light
```

### CSV
```
Category,Number,Prompt
Nature,1,A serene lake reflecting the sunset
Portrait,1,A woman bathed in golden hour light
```

## API Key

Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

## License

MIT

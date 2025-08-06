// Translation module exports

// Main processors
export {
  processEntityTranslation,
  processProductTranslation,
  processCompanyTranslation,
  processBatchTranslation,
  getTranslationStats
} from './processor'

// Services
export {
  getTranslationService,
  submitTranslationJob,
  testTranslationService
} from './service'

// Helpers
export {
  extractProductFields,
  extractCompanyFields,
  createTranslationJob,
  shouldTranslateEntity
} from './helpers'

// Types
export type {
  TranslationJob,
  TranslationResponse,
  TargetLanguage,
  ProductFields,
  CompanyFields,
  EntityFields
} from './types'

export {
  TARGET_LANGUAGES
} from './types'
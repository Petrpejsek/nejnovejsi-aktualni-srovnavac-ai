// Translation service types and interfaces

export interface TranslationJob {
  entity_type: 'product' | 'company'
  entity_id: string
  source_lang: 'en'
  target_langs: ['de', 'fr', 'es', 'cs']
  fields: Record<string, string | string[]>
}

export interface TranslationResponse {
  success: boolean
  job_id?: string
  error?: string
  message?: string
}

// Supported target languages
export const TARGET_LANGUAGES = ['de', 'fr', 'es', 'cs'] as const
export type TargetLanguage = typeof TARGET_LANGUAGES[number]

// Entity field mappings
export interface ProductFields {
  title: string
  description?: string  
  summary?: string
  features?: string[]
  pros?: string[]
  cons?: string[]
  metaDescription?: string
  keywords?: string[]
}

export interface CompanyFields {
  name: string
  description?: string
  summary?: string
  metaDescription?: string
  keywords?: string[]
}

export type EntityFields = ProductFields | CompanyFields
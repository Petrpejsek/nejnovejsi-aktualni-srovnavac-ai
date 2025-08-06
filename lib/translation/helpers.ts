// Translation helper functions for extracting translatable fields

import { TranslationJob, TARGET_LANGUAGES, ProductFields, CompanyFields } from './types'

/**
 * Extract translatable fields from a Product entity
 */
export function extractProductFields(product: any): ProductFields {
  const fields: ProductFields = {
    title: product.name || product.title || ''
  }

  // Add optional fields if they exist and are not empty
  if (product.description && product.description.trim()) {
    fields.description = product.description.trim()
  }

  if (product.summary && product.summary.trim()) {
    fields.summary = product.summary.trim()
  }

  if (product.metaDescription && product.metaDescription.trim()) {
    fields.metaDescription = product.metaDescription.trim()
  }

  // Handle JSON array fields
  try {
    if (product.advantages && typeof product.advantages === 'string') {
      const advantages = JSON.parse(product.advantages)
      if (Array.isArray(advantages) && advantages.length > 0) {
        fields.pros = advantages.filter(item => item && item.trim())
      }
    }
  } catch (e) {
    console.warn('Failed to parse product advantages:', e)
  }

  try {
    if (product.disadvantages && typeof product.disadvantages === 'string') {
      const disadvantages = JSON.parse(product.disadvantages)
      if (Array.isArray(disadvantages) && disadvantages.length > 0) {
        fields.cons = disadvantages.filter(item => item && item.trim())
      }
    }
  } catch (e) {
    console.warn('Failed to parse product disadvantages:', e)
  }

  try {
    if (product.tags && typeof product.tags === 'string') {
      const tags = JSON.parse(product.tags)
      if (Array.isArray(tags) && tags.length > 0) {
        fields.keywords = tags.filter(item => item && item.trim())
      }
    }
  } catch (e) {
    console.warn('Failed to parse product tags:', e)
  }

  // If no features are provided, create them from other fields
  if (!fields.features && product.detailInfo && product.detailInfo.trim()) {
    // Extract key features from detail info (simple approach)
    const details = product.detailInfo.trim()
    if (details.length > 0) {
      fields.features = [details]
    }
  }

  return fields
}

/**
 * Extract translatable fields from a Company entity
 */
export function extractCompanyFields(company: any): CompanyFields {
  const fields: CompanyFields = {
    name: company.name || ''
  }

  // Add optional fields if they exist and are not empty
  if (company.description && company.description.trim()) {
    fields.description = company.description.trim()
  }

  if (company.summary && company.summary.trim()) {
    fields.summary = company.summary.trim()
  }

  if (company.metaDescription && company.metaDescription.trim()) {
    fields.metaDescription = company.metaDescription.trim()
  }

  // Handle keywords from company tags or categories
  try {
    if (company.tags && typeof company.tags === 'string') {
      const tags = JSON.parse(company.tags)
      if (Array.isArray(tags) && tags.length > 0) {
        fields.keywords = tags.filter(item => item && item.trim())
      }
    }
  } catch (e) {
    console.warn('Failed to parse company tags:', e)
  }

  return fields
}

/**
 * Create a translation job payload for the external service
 */
export function createTranslationJob(
  entityType: 'product' | 'company',
  entityId: string,
  fields: ProductFields | CompanyFields
): TranslationJob {
  // Filter out empty fields
  const cleanedFields: Record<string, string | string[]> = {}
  
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string' && value.trim().length > 0) {
        cleanedFields[key] = value.trim()
      } else if (Array.isArray(value) && value.length > 0) {
        const filteredArray = value.filter(item => item && item.trim())
        if (filteredArray.length > 0) {
          cleanedFields[key] = filteredArray
        }
      }
    }
  })

  return {
    entity_type: entityType,
    entity_id: entityId,
    source_lang: 'en',
    target_langs: [...TARGET_LANGUAGES],
    fields: cleanedFields
  }
}

/**
 * Validate if entity should be translated (must have lang = "en" and translatable content)
 */
export function shouldTranslateEntity(entity: any, entityType: 'product' | 'company'): boolean {
  // Check if entity has English language (explicit or implicit)
  if (entity.language && entity.language !== 'en') {
    return false
  }

  // Extract fields to check if there's any translatable content
  const fields = entityType === 'product' 
    ? extractProductFields(entity)
    : extractCompanyFields(entity)

  // Must have at least title/name and one other field
  const hasTitle = (fields as any).title || (fields as any).name
  const hasOtherContent = Object.keys(fields).length > 1

  return !!(hasTitle && hasOtherContent)
}
// Translation processor - orchestrates the translation workflow

import { 
  extractProductFields, 
  extractCompanyFields, 
  createTranslationJob, 
  shouldTranslateEntity 
} from './helpers'
import { submitTranslationJob } from './service'
import { TranslationJob } from './types'

/**
 * Process translation for a newly created/updated entity
 * This is the main entry point called from API endpoints
 */
export async function processEntityTranslation(
  entityType: 'product' | 'company',
  entity: any
): Promise<void> {
  try {
    console.log(`🔄 Processing translation for ${entityType}:`, entity.id)

    // Check if entity should be translated
    if (!shouldTranslateEntity(entity, entityType)) {
      console.log(`⏭️ Skipping translation for ${entityType} ${entity.id} - no translatable content or not English`)
      return
    }

    // Extract translatable fields
    const fields = entityType === 'product' 
      ? extractProductFields(entity)
      : extractCompanyFields(entity)

    console.log(`📝 Extracted fields for translation:`, {
      entity_id: entity.id,
      field_count: Object.keys(fields).length,
      fields: Object.keys(fields)
    })

    // Create translation job
    const translationJob = createTranslationJob(entityType, entity.id, fields)

    // Submit to translation service asynchronously
    // We don't await this to avoid blocking the API response
    setImmediate(async () => {
      try {
        const result = await submitTranslationJob(translationJob)
        
        if (result.success) {
          console.log(`✅ Translation job submitted successfully for ${entityType} ${entity.id}`)
          if (result.job_id) {
            console.log(`🆔 Translation job ID: ${result.job_id}`)
          }
        } else {
          console.error(`❌ Translation job failed for ${entityType} ${entity.id}:`, result.error)
          // Log to error tracking service if available
          logTranslationError(entityType, entity.id, result.error || 'Unknown error')
        }
      } catch (error) {
        console.error(`💥 Unexpected error in translation job for ${entityType} ${entity.id}:`, error)
        logTranslationError(
          entityType, 
          entity.id, 
          error instanceof Error ? error.message : 'Unexpected error'
        )
      }
    })

    console.log(`🚀 Translation job queued for ${entityType} ${entity.id}`)

  } catch (error) {
    console.error(`💥 Error in processEntityTranslation for ${entityType}:`, error)
    // Don't throw - we don't want translation errors to break entity creation
  }
}

/**
 * Specifically process product translation
 */
export async function processProductTranslation(product: any): Promise<void> {
  return processEntityTranslation('product', product)
}

/**
 * Specifically process company translation
 */
export async function processCompanyTranslation(company: any): Promise<void> {
  return processEntityTranslation('company', company)
}

/**
 * Batch process multiple entities for translation
 */
export async function processBatchTranslation(
  entities: Array<{ type: 'product' | 'company'; data: any }>
): Promise<void> {
  console.log(`🔄 Processing batch translation for ${entities.length} entities`)

  for (const entity of entities) {
    try {
      await processEntityTranslation(entity.type, entity.data)
    } catch (error) {
      console.error(`❌ Batch translation error for ${entity.type} ${entity.data.id}:`, error)
      // Continue with other entities even if one fails
    }
  }

  console.log(`✅ Batch translation processing completed`)
}

/**
 * Log translation errors for monitoring
 */
function logTranslationError(entityType: string, entityId: string, error: string): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    entity_type: entityType,
    entity_id: entityId,
    error: error,
    service: 'translation'
  }

  console.error('🚨 Translation Error Log:', errorLog)

  // Here you could integrate with error tracking services like:
  // - Sentry: Sentry.captureException(new Error(error), { extra: errorLog })
  // - Slack webhook: send notification to #errors channel
  // - Database: store in error_logs table
  // - Email: send to admin team

  // For now, just console.error which should be picked up by log aggregation
}

/**
 * Get translation statistics (for monitoring/admin dashboard)
 */
export function getTranslationStats() {
  // This could be expanded to track metrics like:
  // - Number of translation jobs submitted today
  // - Success/failure rates
  // - Average processing time
  // - Queue length
  
  return {
    service_status: 'active',
    last_job_submitted: new Date().toISOString(),
    // Add more stats as needed
  }
}
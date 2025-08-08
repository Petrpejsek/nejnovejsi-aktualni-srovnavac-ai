// Translation service for communicating with external Translation Service

import { TranslationJob, TranslationResponse } from './types'

/**
 * Translation Service Client
 * Handles communication with external translation service
 */
class TranslationService {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly timeout: number = 30000 // 30 seconds

  constructor() {
    const baseUrl = process.env.TRANSLATION_SERVICE_URL
    if (!baseUrl) {
      throw new Error('TRANSLATION_SERVICE_URL is required')
    }
    this.baseUrl = baseUrl
    const apiKey = process.env.TRANSLATION_SERVICE_API_KEY
    if (!apiKey) {
      throw new Error('TRANSLATION_SERVICE_API_KEY is required')
    }
    this.apiKey = apiKey
    
    // apiKey is guaranteed above
  }

  /**
   * Send translation job to external service
   */
  async submitTranslationJob(job: TranslationJob): Promise<TranslationResponse> {
    const startTime = Date.now()
    const endpoint = `${this.baseUrl}/translate`

    try {
      console.log(`🌐 Sending translation job to: ${endpoint}`)
      console.log(`📋 Job details:`, {
        entity_type: job.entity_type,
        entity_id: job.entity_id,
        target_langs: job.target_langs,
        fields_count: Object.keys(job.fields).length
      })

      // Prepare request
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(job),
        signal: AbortSignal.timeout(this.timeout)
      }

      // Make request
      const response = await fetch(endpoint, requestOptions)
      const duration = Date.now() - startTime

      // Parse response
      let responseData: any
      try {
        responseData = await response.json()
      } catch (e) {
        responseData = { error: 'Invalid JSON response from translation service' }
      }

      // Log result
      if (response.ok) {
        console.log(`✅ Translation job submitted successfully in ${duration}ms`)
        console.log(`📨 Response:`, responseData)
        return {
          success: true,
          job_id: responseData.job_id,
          message: responseData.message || 'Translation job submitted successfully'
        }
      } else {
        console.error(`❌ Translation service error (${response.status}):`, responseData)
        return {
          success: false,
          error: responseData.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }

    } catch (error) {
      const duration = Date.now() - startTime
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`⏰ Translation request timeout after ${duration}ms`)
          return {
            success: false,
            error: 'Translation service timeout (30s)'
          }
        }
        
        if (error.message.includes('fetch')) {
          console.error(`🔌 Translation service connection failed after ${duration}ms:`, error.message)
          return {
            success: false,
            error: 'Unable to connect to translation service'
          }
        }
      }

      console.error(`💥 Unexpected translation service error after ${duration}ms:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown translation service error'
      }
    }
  }

  /**
   * Test connection to translation service
   */
  async testConnection(): Promise<{ success: boolean; error?: string; response_time?: number }> {
    const startTime = Date.now()
    
    try {
      // Simple health check
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        signal: AbortSignal.timeout(10000) // 10s timeout for health check
      })

      const duration = Date.now() - startTime

      if (response.ok) {
        console.log(`✅ Translation service health check passed in ${duration}ms`)
        return { success: true, response_time: duration }
      } else {
        console.error(`❌ Translation service health check failed: ${response.status}`)
        return { 
          success: false, 
          error: `Health check failed: HTTP ${response.status}`,
          response_time: duration
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`💥 Translation service health check error after ${duration}ms:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Health check failed',
        response_time: duration
      }
    }
  }

  /**
   * Get service configuration info
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      timeout: this.timeout
    }
  }
}

// Singleton instance
let translationService: TranslationService | null = null

/**
 * Get translation service instance
 */
export function getTranslationService(): TranslationService {
  if (!translationService) {
    translationService = new TranslationService()
  }
  return translationService
}

/**
 * Convenience function to submit translation job
 */
export async function submitTranslationJob(job: TranslationJob): Promise<TranslationResponse> {
  const service = getTranslationService()
  return service.submitTranslationJob(job)
}

/**
 * Convenience function to test service connection
 */
export async function testTranslationService() {
  const service = getTranslationService()
  return service.testConnection()
}
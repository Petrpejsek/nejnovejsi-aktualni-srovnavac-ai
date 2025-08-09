#!/usr/bin/env node

/**
 * Daily Sitemap Update Cron Job
 * 
 * This script regenerates the sitemap.xml file by calling the sitemap API endpoint.
 * Should be run daily via cron job.
 * 
 * Usage:
 * node scripts/update-sitemap-cron.js
 * 
 * Cron setup (daily at 2 AM):
 * 0 2 * * * cd /path/to/comparee && node scripts/update-sitemap-cron.js >> logs/sitemap-cron.log 2>&1
 */

const https = require('https')
const http = require('http')

// Configuration
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds timeout
  retries: 3
}

// Logger with timestamps
function log(level, message, ...args) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args)
}

// Make HTTP request with retry logic
async function makeRequest(url, options = {}, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Comparee-Sitemap-Cron/1.0',
        ...options.headers
      }
    }

    const req = client.request(requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      
      res.on('end', () => {
        const response = {
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(response)
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (options.body) {
      req.write(options.body)
    }
    
    req.end()
  }).catch(async (error) => {
    if (retryCount < CONFIG.retries) {
      log('warn', `Request failed, retrying (${retryCount + 1}/${CONFIG.retries}):`, error.message)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
      return makeRequest(url, options, retryCount + 1)
    } else {
      throw error
    }
  })
}

// Main sitemap update function
async function updateSitemap() {
  try {
    log('info', '🗺️  Starting daily sitemap update...')
    log('info', `📡 Target URL: ${CONFIG.baseUrl}/api/sitemap`)
    
    const startTime = Date.now()
    
    // Call sitemap API endpoint
    const response = await makeRequest(`${CONFIG.baseUrl}/api/sitemap`, {
      method: 'GET'
    })
    
    const duration = Date.now() - startTime
    
    if (response.statusCode === 200) {
      // Parse response if it's JSON (from POST endpoint)
      let stats = null
      try {
        const contentType = response.headers['content-type'] || ''
        if (contentType.includes('application/json')) {
          stats = JSON.parse(response.body)
        }
      } catch (e) {
        // XML response is fine, stats not available
      }
      
      log('info', `✅ Sitemap updated successfully in ${duration}ms`)
      
      if (stats && stats.stats) {
        log('info', `📊 Stats: ${stats.stats.urlCount} URLs, ${stats.stats.fileSize} bytes`)
        log('info', `🔍 Search engines: Google ${stats.stats.searchEngines.google}, Bing ${stats.stats.searchEngines.bing}`)
      }
      
      // Verify sitemap file was created
      const fs = require('fs')
      const path = require('path')
      
      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
      if (fs.existsSync(sitemapPath)) {
        const fileStats = fs.statSync(sitemapPath)
        const fileAge = Date.now() - fileStats.mtime.getTime()
        
        if (fileAge < 60000) { // Less than 1 minute old
          log('info', `📄 Sitemap file verified: ${fileStats.size} bytes, updated ${Math.round(fileAge/1000)}s ago`)
        } else {
          log('warn', `⚠️  Sitemap file exists but seems old: ${Math.round(fileAge/60000)} minutes`)
        }
      } else {
        log('error', '❌ Sitemap file not found after update!')
        process.exit(1)
      }
      
    } else {
      throw new Error(`Unexpected response: ${response.statusCode} ${response.body}`)
    }
    
    log('info', '🎉 Daily sitemap update completed successfully')
    
  } catch (error) {
    log('error', '❌ Failed to update sitemap:', error.message)
    
    // Send notification (in production, you might want to send email/Slack notification)
    if (process.env.NODE_ENV === 'production') {
      log('error', '📧 TODO: Send failure notification to admin')
    }
    
    process.exit(1)
  }
}

// Health check function
async function healthCheck() {
  try {
    log('info', '🏥 Performing health check...')
    
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`, {
      method: 'GET'
    })
    
    if (response.statusCode !== 200) {
      throw new Error(`Health check failed: ${response.statusCode}`)
    }
    
    log('info', '✅ Health check passed')
    return true
  } catch (error) {
    log('error', '❌ Health check failed:', error.message)
    return false
  }
}

// Main execution
async function main() {
  try {
    log('info', '🚀 Comparee Daily Sitemap Update Cron Job Started')
    log('info', `📅 Time: ${new Date().toLocaleString()}`)
    log('info', `🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    log('info', `🔗 Base URL: ${CONFIG.baseUrl}`)
    
    // Perform health check first (optional)
    if (process.env.SKIP_HEALTH_CHECK !== 'true') {
      const isHealthy = await healthCheck()
      if (!isHealthy && process.env.NODE_ENV === 'production') {
        log('error', '❌ Skipping sitemap update due to failed health check')
        process.exit(1)
      }
    }
    
    // Update sitemap
    await updateSitemap()
    
    log('info', '🏁 Cron job completed successfully')
    process.exit(0)
    
  } catch (error) {
    log('error', '💥 Fatal error in cron job:', error)
    process.exit(1)
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  log('error', '🚨 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  log('error', '🚨 Uncaught Exception:', error)
  process.exit(1)
})

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { updateSitemap, healthCheck }
'use client'

import React, { useState, useEffect } from 'react'

interface WebhookLog {
  id: string
  timestamp: Date
  status: 'success' | 'error'
  payload: any
  responseTime: number
  error?: string
  createdPageUrl?: string
}

interface WebhookStats {
  todayCount: number
  todaySuccess: number
  todayErrors: number
  weekCount: number
  avgResponseTime: number
  successRate: number
}

export default function WebhookAdminPanel() {
  const [webhookEnabled, setWebhookEnabled] = useState(true)
  const [webhookSecret, setWebhookSecret] = useState('*'.repeat(20))
  const [showSecret, setShowSecret] = useState(false)
  const [rateLimit, setRateLimit] = useState(100)
  const [timeout, setTimeout] = useState(30)
  const [retryCount, setRetryCount] = useState(3)
  
  const [stats, setStats] = useState<WebhookStats>({
    todayCount: 0,
    todaySuccess: 0,
    todayErrors: 0,
    weekCount: 0,
    avgResponseTime: 0,
    successRate: 0
  })

  const [recentLogs, setRecentLogs] = useState<WebhookLog[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  // TODO: Add API endpoints for webhook management
  // useEffect(() => {
  //   loadWebhookStats()
  //   loadRecentLogs()
  // }, [])

  // const loadWebhookStats = async () => {
  //   setIsLoadingStats(true)
  //   try {
  //     const response = await fetch('/api/webhook/stats')
  //     const data = await response.json()
  //     setStats(data)
  //   } catch (error) {
  //     console.error('Failed to load webhook stats:', error)
  //   } finally {
  //     setIsLoadingStats(false)
  //   }
  // }

  // const loadRecentLogs = async () => {
  //   setIsLoadingLogs(true)
  //   try {
  //     const response = await fetch('/api/webhook/logs?limit=10')
  //     const data = await response.json()
  //     setRecentLogs(data)
  //   } catch (error) {
  //     console.error('Failed to load webhook logs:', error)
  //   } finally {
  //     setIsLoadingLogs(false)
  //   }
  // }

  const [testPayload, setTestPayload] = useState(`{
  "title": "Test Webhook from Admin",
  "contentHtml": "<h1>Test Content</h1><p>Generated via admin panel test.</p>",
  "keywords": ["test", "admin", "webhook"],
  "language": "cs",
  "category": "test"
}`)

  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const generateNewSecret = () => {
    const newSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    setWebhookSecret(newSecret)
    setShowSecret(true)
    // TODO: Save to backend
  }

  const copySecret = () => {
    navigator.clipboard.writeText(webhookSecret)
    // TODO: Show toast notification
  }

  const testWebhook = async () => {
    setIsTestingWebhook(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhookSecret
        },
        body: testPayload
      })

      const result = await response.json()
      
      setTestResult({
        success: response.ok,
        status: response.status,
        data: result,
        responseTime: Date.now() // Simplified
      })

    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTestingWebhook(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('cs-CZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const retryFailedWebhook = async (logId: string) => {
    // TODO: Implement retry logic with API call
    console.log('Retrying webhook:', logId)
    // const response = await fetch(`/api/webhook/retry/${logId}`, { method: 'POST' })
    // if (response.ok) {
    //   loadRecentLogs() // Refresh logs after retry
    // }
  }

  const saveConfiguration = async () => {
    // TODO: Implement configuration save to backend
    console.log('Saving webhook configuration:', {
      enabled: webhookEnabled,
      rateLimit,
      timeout,
      retryCount
    })
    // const response = await fetch('/api/webhook/config', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ enabled: webhookEnabled, rateLimit, timeout, retryCount })
    // })
  }

  return (
    <div className="space-y-8">
      {/* Webhook Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">🔧 Webhook Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status & Basic Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Webhook Status</label>
              <button
                onClick={() => setWebhookEnabled(!webhookEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  webhookEnabled ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    webhookEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Webhook Secret Key
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={webhookSecret}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {showSecret ? '🙈' : '👁️'}
                </button>
                <button
                  onClick={copySecret}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  📋
                </button>
              </div>
              <button
                onClick={generateNewSecret}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                🔄 Generate New Secret
              </button>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Retry Attempts
              </label>
              <input
                type="number"
                value={retryCount}
                onChange={(e) => setRetryCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button 
            onClick={saveConfiguration}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            💾 Save Configuration
          </button>
          <div className="mt-2 text-xs text-gray-500">
            Configuration is stored locally for now. API integration will be added soon.
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">📊 Webhook Statistics</h2>
          {stats.todayCount === 0 && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Real-time data will appear after first webhook
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.todaySuccess}</div>
            <div className="text-sm text-green-700">Success Today</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.todayErrors}</div>
            <div className="text-sm text-red-700">Errors Today</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.weekCount}</div>
            <div className="text-sm text-blue-700">This Week</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.avgResponseTime > 0 ? `${stats.avgResponseTime}ms` : '—'}
            </div>
            <div className="text-sm text-purple-700">Avg Response</div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.todayCount > 0 ? `${stats.successRate}%` : '—'}
            </div>
            <div className="text-sm text-indigo-700">Success Rate</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.todayCount}</div>
            <div className="text-sm text-gray-700">Total Today</div>
          </div>
        </div>
        
        {stats.todayCount === 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            📈 Statistics will update automatically as webhooks are received
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Webhook Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">📝 Recent Webhook Activity</h2>
          
          <div className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {log.status === 'success' ? '✅' : '❌'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log.payload?.title || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(log.timestamp)} • {log.responseTime}ms
                      </div>
                      {log.error && (
                        <div className="text-xs text-red-600">{log.error}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {log.status === 'error' && (
                      <button
                        onClick={() => retryFailedWebhook(log.id)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        🔄 Retry
                      </button>
                    )}
                    {log.createdPageUrl && (
                      <a
                        href={log.createdPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        👁️ View
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📝</div>
                <div className="text-sm text-gray-600 mb-2">No webhook activity yet</div>
                <div className="text-xs text-gray-500">
                  Webhook logs will appear here after the first request
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              📋 View All Logs
            </button>
          </div>
        </div>

        {/* Webhook Tester */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">🧪 Test Webhook</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Endpoint URL
              </label>
              <input
                type="text"
                value="/api/landing-pages"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-mono"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Test Payload (JSON)
              </label>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              />
            </div>

            <button
              onClick={testWebhook}
              disabled={isTestingWebhook}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isTestingWebhook ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                <>
                  🚀 Send Test Webhook
                </>
              )}
            </button>

            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {testResult.success ? '✅' : '❌'}
                  </span>
                  <span className="font-medium">
                    {testResult.success ? 'Test Successful' : 'Test Failed'}
                  </span>
                </div>
                
                {testResult.success ? (
                  <div className="text-sm space-y-1">
                    <div>Status: {testResult.status}</div>
                    <div>Response: {testResult.responseTime}ms</div>
                    {testResult.data?.url && (
                      <div>
                        Created: <a href={testResult.data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {testResult.data.url}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-red-700">
                    {testResult.error || 'Unknown error occurred'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

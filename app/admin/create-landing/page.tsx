'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ManualCreatePanel from './components/ManualCreatePanel'
import WebhookAdminPanel from './components/WebhookAdminPanel'

type TabType = 'manual' | 'webhook' | 'stats'

export default function CreateLandingPage() {
  const { isAdmin, isLoading, user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('manual')

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ověřování oprávnění...</p>
        </div>
      </div>
    )
  }

  // Admin access protection
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚫</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Přístup odepřen</h1>
            <p className="text-gray-600 mb-4">
              Tato stránka je přístupná pouze administrátorům.
            </p>
            <p className="text-sm text-gray-500">
              {user ? `Přihlášen jako: ${user.email}` : 'Nejste přihlášeni'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'manual' as TabType, name: '📝 Manual Create', description: 'Ruční vytváření landing pages' },
    { id: 'webhook' as TabType, name: '🔧 Webhook Admin', description: 'Správa webhook integrace' },
    { id: 'stats' as TabType, name: '📊 Statistics', description: 'Statistiky a monitoring' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Landing Pages & Webhook Administration</h1>
        <p className="text-gray-600">
          Správa landing pages - ruční vytváření, webhook integrace a monitoring.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'manual' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Ruční vytváření Landing Pages</h2>
              <p className="text-gray-600">Vytvoření landing page pomocí JSON payloadu z AI farmy.</p>
            </div>
            <ManualCreatePanel />
          </div>
        )}

        {activeTab === 'webhook' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Webhook Administration</h2>
              <p className="text-gray-600">Správa webhook integrace, konfigurace a monitoring.</p>
            </div>
            <WebhookAdminPanel />
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Statistics & Monitoring</h2>
              <p className="text-gray-600">Detailní statistiky a monitoring webhook aktivit.</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📊</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Statistics</h3>
                <p className="text-gray-600 mb-4">
                  Pokročilé statistiky a grafy budou implementovány v dalších verzích.
                </p>
                <div className="text-sm text-gray-500">
                  • Success rate trends<br/>
                  • Response time graphs<br/>
                  • Volume analytics<br/>
                  • Error categorization
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
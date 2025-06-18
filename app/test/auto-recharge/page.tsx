'use client'

import { useState, useEffect } from 'react'

interface CompanyData {
  id: string
  name: string
  balance: number
  autoRecharge: boolean
  autoRechargeAmount?: number
  autoRechargeThreshold?: number
}

export default function AutoRechargeTestPage() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/advertiser/billing', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setCompanyData(data.data.company)
      } else {
        setResult('Error: ' + data.error)
      }
    } catch (error) {
      setResult('Network error: ' + error)
    }
  }

  const simulateClick = async () => {
    setLoading(true)
    setResult('Simulating click...')

    try {
      // Get a test product ID
      const productsResponse = await fetch('/api/products?page=1&pageSize=1')
      const productsData = await productsResponse.json()
      
      if (productsData.products && productsData.products.length > 0) {
        const testProductId = productsData.products[0].id
        
        // Simulate click that should trigger auto-recharge
        const clickResponse = await fetch('/api/ads/click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: testProductId
          })
        })

        const clickResult = await clickResponse.json()
        
        if (clickResponse.ok) {
          setResult(`Click successful! Remaining balance: $${clickResult.remainingBalance}`)
          await fetchCompanyData() // Refresh company data
        } else {
          setResult(`Click failed: ${clickResult.error}`)
        }
      } else {
        setResult('No products found for testing')
      }
    } catch (error) {
      setResult('Error simulating click: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const updateAutoRecharge = async (enabled: boolean, threshold: number, amount: number) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/advertiser/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'auto-recharge',
          autoRecharge: enabled,
          autoRechargeAmount: enabled ? amount : null,
          autoRechargeThreshold: enabled ? threshold : null
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setResult('Auto-recharge settings updated successfully!')
        await fetchCompanyData()
      } else {
        setResult(`Error: ${result.error || 'Failed to update auto-recharge settings'}`)
      }
    } catch (error) {
      setResult('Network error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanyData()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Auto-Recharge Test Page</h1>
      
      {companyData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Company Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company:</label>
              <p className="text-lg">{companyData.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Balance:</label>
              <p className="text-lg font-bold text-green-600">${companyData.balance.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Auto-Recharge:</label>
              <p className={`text-lg font-semibold ${companyData.autoRecharge ? 'text-green-600' : 'text-red-600'}`}>
                {companyData.autoRecharge ? 'ENABLED' : 'DISABLED'}
              </p>
            </div>
            {companyData.autoRecharge && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Threshold:</label>
                  <p className="text-lg">${companyData.autoRechargeThreshold || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recharge Amount:</label>
                  <p className="text-lg">${companyData.autoRechargeAmount || 'Not set'}</p>
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={fetchCompanyData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Auto-Recharge</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => updateAutoRecharge(true, 50, 200)}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Enable Auto-Recharge (Threshold: $50, Amount: $200)
          </button>
          
          <button
            onClick={() => updateAutoRecharge(true, 30, 100)}
            disabled={loading}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            Enable Auto-Recharge (Threshold: $30, Amount: $100)
          </button>
          
          <button
            onClick={() => updateAutoRecharge(false, 0, 0)}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Disable Auto-Recharge
          </button>
          
          <button
            onClick={simulateClick}
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Simulate Click (Test Auto-Recharge)'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-yellow-800 mb-2">How to Test:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>First, enable auto-recharge with your preferred settings</li>
          <li>Make sure your balance is above the threshold</li>
          <li>Click "Simulate Click" multiple times to lower your balance below the threshold</li>
          <li>Auto-recharge should trigger automatically when balance drops below threshold</li>
          <li>Check the result and refresh data to see the updated balance</li>
        </ol>
      </div>
    </div>
  )
} 
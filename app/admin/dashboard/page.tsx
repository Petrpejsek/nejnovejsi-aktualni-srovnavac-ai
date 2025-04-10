'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/clicks')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetStats = async () => {
    if (!confirm('Opravdu chcete vynulovat všechny statistiky?')) return

    try {
      await fetch('/api/clicks', { method: 'DELETE' })
      fetchStats()
    } catch (error) {
      console.error('Error resetting stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return <div className="p-8">Načítání...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Statistiky kliků</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Celkový počet kliků</h2>
          <p className="text-4xl font-bold text-blue-600">{stats.totalClicks}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Unikátní návštěvníci</h2>
          <p className="text-4xl font-bold text-green-600">{stats.uniqueVisitors}</p>
        </div>
      </div>

      <Button 
        onClick={resetStats}
        variant="destructive"
        className="w-full sm:w-auto"
      >
        Vynulovat statistiky
      </Button>
    </div>
  )
} 
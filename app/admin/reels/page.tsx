'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Reel {
  id: string
  title: string
  description: string | null
  videoUrl: string
  createdAt: string
  updatedAt: string
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadReels()
  }, [])

  const loadReels = async () => {
    try {
      const response = await fetch('/api/reels')
      if (response.ok) {
        const data = await response.json()
        setReels(data)
      } else {
        console.error('Failed to load reels')
      }
    } catch (error) {
      console.error('Error loading reels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/reels/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReels(reels.filter(reel => reel.id !== id))
      } else {
        alert('Failed to delete reel')
      }
    } catch (error) {
      console.error('Error deleting reel:', error)
      alert('Error deleting reel')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Reels</h1>
        <Link
          href="/admin/reels/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          + Add New Reel
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Reels table */}
      {!loading && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {reels.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reels yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first reel.</p>
              <Link
                href="/admin/reels/new"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create First Reel
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reels.map((reel) => (
                  <tr key={reel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{reel.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {reel.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <video
                          src={reel.videoUrl}
                          className="h-12 w-12 rounded object-cover"
                          muted
                          preload="metadata"
                        />
                        <a
                          href={reel.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-purple-600 hover:text-purple-800"
                        >
                          View
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reel.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/reels/${reel.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(reel.id, reel.title)}
                        disabled={deleting === reel.id}
                        className={`text-red-600 hover:text-red-900 ${
                          deleting === reel.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {deleting === reel.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
} 
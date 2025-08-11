'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

type ApiLandingRecord = {
  id: string
  slug: string
  title: string
  language: string
  summary?: string | null
  content_html: string
  meta_description?: string | null
  meta_keywords?: string | null
  faq?: any
  visuals?: any
  updated_at?: string
}

export default function EditLandingPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()

  const { isAdmin, isLoading: authLoading, user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // Editable fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [language, setLanguage] = useState('en')
  const [summary, setSummary] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [keywordsInput, setKeywordsInput] = useState('')
  const [contentHtml, setContentHtml] = useState('')
  const [faqJson, setFaqJson] = useState('')
  const [visualsJson, setVisualsJson] = useState('')

  const viewUrl = useMemo(() => `/${language}/landing/${slug}`, [language, slug])

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`/api/landing-pages/${id}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || `Failed to load (status ${res.status})`)
        }
        const data: ApiLandingRecord = await res.json()

        setTitle(data.title || '')
        setSlug(data.slug || '')
        setLanguage(data.language || 'en')
        setSummary((data.summary as string) || '')
        setMetaDescription((data.meta_description as string) || '')

        // meta_keywords may be JSON array string or comma-separated string
        let parsedKeywords = ''
        const kw = data.meta_keywords || ''
        if (kw) {
          try {
            const arr = JSON.parse(kw)
            if (Array.isArray(arr)) parsedKeywords = arr.join(', ')
            else parsedKeywords = String(kw)
          } catch {
            parsedKeywords = String(kw)
          }
        }
        setKeywordsInput(parsedKeywords)

        setContentHtml(data.content_html || '')
        setFaqJson(data.faq ? JSON.stringify(data.faq, null, 2) : '')
        setVisualsJson(data.visuals ? JSON.stringify(data.visuals, null, 2) : '')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const onSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Normalize keywords into array of strings
      const keywords = keywordsInput
        .split(',')
        .map(k => k.trim())
        .filter(Boolean)

      // Parse optional JSON fields safely
      let faq: any = undefined
      let visuals: any = undefined
      try { if (faqJson.trim()) faq = JSON.parse(faqJson) } catch { /* ignore parse error */ }
      try { if (visualsJson.trim()) visuals = JSON.parse(visualsJson) } catch { /* ignore parse error */ }

      const res = await fetch(`/api/landing-pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          language,
          summary: summary || undefined,
          metaDescription: metaDescription || undefined,
          keywords,
          contentHtml,
          faq,
          visuals
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || `Failed to save (status ${res.status})`)
      }

      setSuccess('Saved successfully')
      if (data?.landingPage?.language) setLanguage(data.landingPage.language)
      if (data?.landingPage?.slug) setSlug(data.landingPage.slug)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access denied</h1>
          <p className="text-gray-600 mb-2">This page is accessible to admins only.</p>
          <p className="text-sm text-gray-500">{user ? `Signed in as: ${user.email}` : 'You are not signed in'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Landing Page</h1>
          <div className="flex items-center gap-2">
            <Link href={viewUrl} target="_blank" className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">View</Link>
            <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{success}</div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading landing page…</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                  <option value="en">English</option>
                  <option value="cs">Czech</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                <input value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <input value={summary} onChange={e => setSummary(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content HTML</label>
                <textarea value={contentHtml} onChange={e => setContentHtml(e.target.value)} rows={14} className="w-full px-3 py-2 border rounded-md font-mono" />
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FAQ (JSON, optional)</label>
                <textarea value={faqJson} onChange={e => setFaqJson(e.target.value)} rows={10} className="w-full px-3 py-2 border rounded-md font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visuals (JSON, optional)</label>
                <textarea value={visualsJson} onChange={e => setVisualsJson(e.target.value)} rows={10} className="w-full px-3 py-2 border rounded-md font-mono" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



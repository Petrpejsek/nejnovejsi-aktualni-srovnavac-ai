'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  required?: boolean
}

interface CategoryItem { id: string; name: string; slug: string }

export default function CategorySelector({ value, onChange, label = 'Kategorie', placeholder = 'Vyber kategorii', required }: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [inputValue, setInputValue] = useState<string>(value || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState<number>(-1)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { setInputValue(value || '') }, [value])

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories?source=all')
      if (!res.ok) return
      const data = await res.json()
      setCategories(Array.isArray(data.categories) ? data.categories : [])
    } catch {}
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const exists = useMemo(() => categories.some(c => c.name.toLowerCase() === inputValue.trim().toLowerCase()), [categories, inputValue])

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase()
    const list = query
      ? categories.filter(c => c.name.toLowerCase().includes(query))
      : categories
    return list.slice(0, 8)
  }, [categories, inputValue])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setHighlightIndex(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleCreate = async () => {
    const name = inputValue.trim()
    if (!name) return
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create category')
      }
      setCategories(prev => [...prev, data.category])
      setInputValue(name)
      onChange(name)
      setIsOpen(false)
    } catch (e: any) {
      setError(e?.message || 'Error creating category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectSuggestion = (name: string) => {
    setInputValue(name)
    onChange(name)
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-sm font-medium text-gray-700">{label}{required ? ' *' : ''}</label>
      <div className="mt-1 flex gap-2 items-stretch">
        <input
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); onChange(e.target.value); setIsOpen(true); setHighlightIndex(-1) }}
          onFocus={async () => {
            setIsOpen(true)
            if (categories.length === 0) {
              await loadCategories()
            }
          }}
          onKeyDown={(e) => {
            if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { setIsOpen(true); return }
            if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex(i => Math.min(i + 1, suggestions.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex(i => Math.max(i - 1, 0)) }
            if (e.key === 'Enter') {
              if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
                e.preventDefault(); selectSuggestion(suggestions[highlightIndex].name)
              } else if (!exists && inputValue.trim()) {
                e.preventDefault(); handleCreate()
              }
            }
            if (e.key === 'Escape') { setIsOpen(false); setHighlightIndex(-1) }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          required={required}
          role="combobox"
          aria-expanded={isOpen}
        />
        {!exists && inputValue.trim() && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting}
            className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            title={`Vytvořit kategorii "${inputValue.trim()}"`}
          >
            {isSubmitting ? 'Ukládám…' : 'Vytvořit'}
          </button>
        )}
      </div>

      {isOpen && (suggestions.length > 0 || (!exists && inputValue.trim())) && (
        <div className="absolute z-20 mt-2 w-full min-w-[16rem] rounded-md border border-gray-200 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((cat, idx) => (
              <li key={cat.id}>
                <button
                  type="button"
                  className={`w-full text-left px-4 py-2 ${idx === highlightIndex ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'}`}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onMouseLeave={() => setHighlightIndex(-1)}
                  onClick={() => selectSuggestion(cat.name)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
            {!exists && inputValue.trim() && (
              <li className="border-t border-gray-100 mt-1 pt-1">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-purple-700 hover:bg-purple-50"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Ukládám…' : `Vytvořit "${inputValue.trim()}"`}
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}



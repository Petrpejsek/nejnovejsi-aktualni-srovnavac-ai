'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type Category = { id: string; name: string; slug: string }

interface MultiCategorySelectorProps {
  value: Category[]
  onChange: (value: Category[]) => void
  label?: string
  placeholder?: string
  max?: number
}

export default function MultiCategorySelector({ value, onChange, label = 'Additional categories', placeholder = 'Type to search categories…', max = 5 }: MultiCategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/categories?source=all')
      if (!res.ok) return
      const data = await res.json()
      setCategories(Array.isArray(data.categories) ? data.categories : [])
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories
      .filter(c => !value.some(v => v.id === c.id))
      .filter(c => !q || c.name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [categories, value, query])

  const add = (c: Category) => {
    if (value.length >= max) return
    onChange([...value, c])
    setQuery('')
    inputRef.current?.focus()
  }

  const remove = (id: string) => {
    onChange(value.filter(v => v.id !== id))
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="mt-1">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map(v => (
            <span key={v.id} className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-purple-100 text-purple-800">
              {v.name}
              <button type="button" onClick={() => remove(v.id)} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
            </span>
          ))}
        </div>
        {value.length < max && (
          <div className="relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder={placeholder}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 px-3 py-2"
            />
            {open && filtered.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filtered.map(c => (
                  <button key={c.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(c)} className="w-full text-left px-4 py-2 hover:bg-gray-50">
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}



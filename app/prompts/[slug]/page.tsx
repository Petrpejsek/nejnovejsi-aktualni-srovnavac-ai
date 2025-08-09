'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function PromptDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug || ''

  // Placeholder detail – backend napojíme následně
  const meta = {
    title: 'Prompt Detail',
    priceUsd: 12,
    model: 'GPT-4',
    rating: 4.8,
    downloads: 123,
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/prompts" className="text-gray-600 hover:text-black">← Back to prompts</Link>
        <h1 className="mt-4 text-4xl font-bold text-gray-900">{meta.title}</h1>
        <div className="mt-2 text-gray-600">{meta.model} • ★ {meta.rating} • {meta.downloads} sales</div>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">What you get</h2>
          <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
            <li>Clean prompt template with variables</li>
            <li>Usage tips and examples</li>
            <li>Model-specific instructions</li>
          </ul>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">${'{'}meta.priceUsd{'}'}</div>
            <button className="px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black">Add to cart</button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900">Examples</h3>
          <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm">
            Example input and output will be here.
          </div>
        </div>
      </div>
    </main>
  )
}



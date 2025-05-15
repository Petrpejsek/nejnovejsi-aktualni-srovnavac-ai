'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SimpleProductsAdminPage() {
  const [content, setContent] = useState<React.ReactNode>(
    <div>Načítání...</div>
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setContent(<div>Načítání seznamu produktů...</div>)
      
      // Používáme jednodušší endpoint
      const response = await fetch('/api/simple-list', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        setContent(
          <div className="p-4 bg-red-100 rounded-lg border border-red-400 text-red-700">
            <h3 className="font-bold">Chyba serveru</h3>
            <p>Nepodařilo se získat data z API. Status: {response.status}</p>
            <button 
              onClick={loadData}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
            >
              Zkusit znovu
            </button>
          </div>
        )
        return
      }
      
      // Získáme surový text odpovědi
      const responseText = await response.text()
      
      try {
        // Zkusíme zparsovat data jako JSON
        const data = JSON.parse(responseText)
        
        // Zkontrolujeme, jestli odpověď obsahuje pole produktů
        if (!data || !data.products || !Array.isArray(data.products)) {
          setContent(
            <div className="p-4 bg-yellow-100 rounded-lg border border-yellow-400 text-yellow-700">
              <h3 className="font-bold">Neplatná odpověď</h3>
              <p>Server vrátil neplatná data.</p>
              <button 
                onClick={loadData}
                className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Zkusit znovu
              </button>
              <pre className="mt-4 text-xs overflow-auto max-h-40">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )
          return
        }
        
        // Produkty jsou platné, vytvoříme tabulku
        const productCount = data.count || data.products.length
        
        // Jednoduché generování tabulky
        const table = (
          <div>
            <p className="mb-2">Celkem produktů: {productCount}</p>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Název</th>
                  <th className="py-2 px-4 border-b text-left">Kategorie</th>
                  <th className="py-2 px-4 border-b text-left">Cena</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{product.id || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{product.name || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{product.category || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{product.price || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        
        // Nastavíme celý obsah stránky včetně tabulky
        setContent(table)
      } catch (error) {
        // Chyba při parsování JSON
        setContent(
          <div className="p-4 bg-red-100 rounded-lg border border-red-400 text-red-700">
            <h3 className="font-bold">Chyba zpracování dat</h3>
            <p>Nepodařilo se zpracovat data z API.</p>
            <p className="text-sm">Chyba: {error instanceof Error ? error.message : String(error)}</p>
            <button 
              onClick={loadData}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
            >
              Zkusit znovu
            </button>
            <div className="mt-4">
              <p className="font-bold text-sm">Surová odpověď:</p>
              <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
                {responseText.substring(0, 500)}
                {responseText.length > 500 ? '...' : ''}
              </pre>
            </div>
          </div>
        )
      }
    } catch (error) {
      // Obecná chyba
      setContent(
        <div className="p-4 bg-red-100 rounded-lg border border-red-400 text-red-700">
          <h3 className="font-bold">Chyba</h3>
          <p>Nastala neočekávaná chyba při načítání dat.</p>
          <p className="text-sm">Detail: {error instanceof Error ? error.message : String(error)}</p>
          <button 
            onClick={loadData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Zkusit znovu
          </button>
        </div>
      )
    }
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seznam produktů</h1>
        <div className="space-x-2">
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Zpět
          </Link>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Obnovit
          </button>
        </div>
      </div>
      
      {/* Hlavní obsah stránky */}
      {content}
    </div>
  )
} 
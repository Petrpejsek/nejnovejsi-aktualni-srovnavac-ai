'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function UltraSimpleProductsPage() {
  const [content, setContent] = useState<string>('Načítání...')
  
  // Jednoduchá funkce pro načtení produktů
  async function loadProducts() {
    try {
      setContent('Načítání seznamu produktů...')
      
      // Načteme data z API
      const res = await fetch('/api/products?pageSize=100', { 
        cache: 'no-store' 
      })
      
      if (!res.ok) {
        setContent(`Chyba serveru: ${res.status} ${res.statusText}`)
        return
      }
      
      // Získáme odpověď jako text
      const text = await res.text()
      
      try {
        // Zkusíme text zparsovat jako JSON
        const data = JSON.parse(text)
        
        if (!data.products || !Array.isArray(data.products)) {
          setContent('Chyba: Server nevrátil platný seznam produktů')
          return
        }
        
        // Vytvoříme HTML tabulku ručně
        let tableHtml = `
          <div class="mb-4">
            <p>Nalezeno celkem ${data.products.length} produktů</p>
          </div>
          <table class="min-w-full bg-white border border-gray-300">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-4 border-b">ID</th>
                <th class="py-2 px-4 border-b">Název</th>
                <th class="py-2 px-4 border-b">Kategorie</th>
                <th class="py-2 px-4 border-b">Cena</th>
              </tr>
            </thead>
            <tbody>
        `
        
        // Projdeme všechny produkty a přidáme je do tabulky
        if (data.products.length === 0) {
          tableHtml += `
            <tr>
              <td colspan="4" class="py-4 px-4 text-center">Žádné produkty nebyly nalezeny</td>
            </tr>
          `
        } else {
          data.products.forEach((product: any) => {
            tableHtml += `
              <tr class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">${product.id || 'N/A'}</td>
                <td class="py-2 px-4 border-b">${product.name || 'N/A'}</td>
                <td class="py-2 px-4 border-b">${product.category || 'N/A'}</td>
                <td class="py-2 px-4 border-b">${product.price || 'N/A'}</td>
              </tr>
            `
          })
        }
        
        tableHtml += `
            </tbody>
          </table>
        `
        
        // Nastavíme hotovou HTML tabulku jako obsah
        setContent(tableHtml)
        
      } catch (error) {
        setContent(`Chyba při zpracování odpovědi: ${error instanceof Error ? error.message : 'Neznámá chyba'}<br><br>Surová odpověď:<br><pre class="text-xs overflow-auto max-h-60 bg-gray-100 p-2">${text.substring(0, 1000)}${text.length > 1000 ? '...' : ''}</pre>`)
      }
    } catch (error) {
      setContent(`Chyba: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
    }
  }
  
  // Načteme produkty při načtení stránky
  useEffect(() => {
    loadProducts()
  }, [])
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zjednodušená správa produktů</h1>
        <div className="space-x-2">
          <Link href="/admin" className="px-4 py-2 bg-gray-200 rounded">
            Zpět do administrace
          </Link>
          <button onClick={loadProducts} className="px-4 py-2 bg-blue-500 text-white rounded">
            Obnovit data
          </button>
        </div>
      </div>
      
      {/* Zobrazení obsahu pomocí dangerouslySetInnerHTML */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
} 
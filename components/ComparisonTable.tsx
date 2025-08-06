'use client'

import React from 'react'

interface ComparisonRow {
  feature: string
  values: (string | number | boolean | null)[]
  highlight?: number[] // Index sloupců k zvýraznění
  type?: 'text' | 'number' | 'boolean' | 'price' | 'rating'
}

interface ComparisonTableProps {
  title: string
  subtitle?: string
  headers: string[] // První je vždy "Feature", další jsou názvy produktů/služeb
  rows: ComparisonRow[]
  highlightColumns?: number[] // Které sloupce zvýraznit globálně
  className?: string
  style?: 'modern' | 'classic' | 'minimal'
}

export default function ComparisonTable({
  title,
  subtitle,
  headers,
  rows,
  highlightColumns = [],
  className = '',
  style = 'modern'
}: ComparisonTableProps) {

  const renderCell = (value: string | number | boolean | null, type: string = 'text') => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>
    }

    switch (type) {
      case 'boolean':
        return value ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Ano
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✗ Ne
          </span>
        )
      
      case 'price':
        return (
          <span className="font-semibold text-gray-900">
            {typeof value === 'number' ? `${value} Kč` : value}
          </span>
        )
      
      case 'rating':
        const rating = typeof value === 'number' ? value : parseFloat(value as string)
        return (
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900">{rating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star}
                  className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )
      
      case 'number':
        return <span className="font-medium text-gray-900">{value}</span>
      
      default:
        return <span className="text-gray-900">{value}</span>
    }
  }

  const getStyleClasses = () => {
    switch (style) {
      case 'classic':
        return {
          container: 'border border-gray-300 rounded-lg',
          header: 'bg-gray-100 border-b border-gray-300',
          headerCell: 'px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-300 last:border-r-0',
          row: 'border-b border-gray-200 last:border-b-0',
          cell: 'px-4 py-3 text-sm text-center border-r border-gray-200 last:border-r-0'
        }
      
      case 'minimal':
        return {
          container: 'border-b border-gray-200',
          header: 'border-b-2 border-gray-300',
          headerCell: 'px-3 py-2 text-sm font-semibold text-gray-900',
          row: 'border-b border-gray-100 last:border-b-0',
          cell: 'px-3 py-2 text-sm text-center'
        }
      
      default: // modern
        return {
          container: 'rounded-xl border border-gray-200 shadow-sm overflow-hidden',
          header: 'bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200',
          headerCell: 'px-6 py-4 text-sm font-semibold text-gray-900',
          row: 'border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors',
          cell: 'px-6 py-4 text-sm text-center'
        }
    }
  }

  const styles = getStyleClasses()

  return (
    <div className={`my-8 ${className}`}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        {subtitle && (
          <p className="text-gray-600 text-lg">{subtitle}</p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className={styles.container}>
          <table className="min-w-full">
            {/* Header */}
            <thead className={styles.header}>
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className={`${styles.headerCell} ${index === 0 ? 'text-left' : 'text-center'} ${
                      highlightColumns.includes(index) ? 'bg-blue-50 text-blue-900' : ''
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="bg-white">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={styles.row}>
                  {/* Feature name */}
                  <td className={`${styles.cell} font-medium text-gray-900 bg-gray-50 text-left`}>
                    {row.feature}
                  </td>
                  
                  {/* Values */}
                  {row.values.map((value, colIndex) => {
                    const isHighlighted = highlightColumns.includes(colIndex + 1) || 
                                        row.highlight?.includes(colIndex + 1)
                    
                    return (
                      <td 
                        key={colIndex} 
                        className={`${styles.cell} ${
                          isHighlighted ? 'bg-blue-50 border-l-2 border-blue-400' : ''
                        }`}
                      >
                        {renderCell(value, row.type)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend for highlighted columns */}
      {highlightColumns.length > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
            Doporučené možnosti
          </div>
        </div>
      )}
    </div>
  )
}

// Export typu pro externí použití
export type { ComparisonTableProps, ComparisonRow }
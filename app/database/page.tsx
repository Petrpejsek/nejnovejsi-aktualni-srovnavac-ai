'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  website: string;
  pricing: string;
  tags: string[];
  isAiFocused: boolean;
  logoUrl?: string;
  shortDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function DatabasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 50;

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products?page=${page}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error(`Chyba při načítání: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Načtená data:', data);
      
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch (err) {
      console.error('Chyba při načítání produktů:', err);
              setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalProducts / pageSize);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">📊 Databáze Produktů</h1>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4">Načítám data z databáze...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">📊 Databáze Produktů</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Chyba: </strong>{error}
          <button 
            onClick={() => fetchProducts(currentPage)}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">📊 Databáze Produktů</h1>
      
      {/* Statistiky */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Celkem produktů</h3>
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Aktuální stránka</h3>
            <p className="text-3xl font-bold text-green-600">{currentPage} / {totalPages}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Zobrazeno</h3>
            <p className="text-3xl font-bold text-purple-600">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Navigace */}
      {totalPages > 1 && (
        <div className="mb-6 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            První
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Předchozí
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Další
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Poslední
          </button>
        </div>
      )}

      {/* Tabulka produktů */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Název
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Focused
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tagy
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {product.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {product.shortDescription || product.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {product.website && (
                      <a 
                        href={product.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {product.website.replace('https://', '').replace('http://', '').slice(0, 30)}...
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.pricing}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.isAiFocused 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isAiFocused ? 'Ano' : 'Ne'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {product.tags?.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags && product.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spodní navigace */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            První
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Předchozí
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Další
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Poslední
          </button>
        </div>
      )}

      {/* Refresh tlačítko */}
      <div className="mt-8 text-center">
        <button
          onClick={() => fetchProducts(currentPage)}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          🔄 Obnovit data
        </button>
      </div>
    </div>
  );
} 
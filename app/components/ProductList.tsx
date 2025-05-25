'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface AIProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  tags: string[];
  advantages: string[];
  disadvantages: string[];
  detailInfo: string;
  pricingInfo: {
    basic: string;
    pro: string;
    enterprise: string;
  };
  videoUrls: string[];
  externalUrl: string;
  hasTrial: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
}

interface ProductsResponse {
  products: AIProduct[];
  pagination: Pagination;
}

// Cache pro uložení dat
const cache: { [key: string]: { data: ProductsResponse; timestamp: number } } = {};
const CACHE_DURATION = 60 * 1000; // 60 sekund v milisekundách

const filterProducts = (products: AIProduct[], category: string | null, provider: string | null, minPrice: string | null, maxPrice: string | null) => {
  if (!products) return [];
  
  return products.filter(product => {
    if (category && product.category !== category) return false;
    if (provider && !product.tags.includes(provider)) return false;
    if (minPrice && product.price < parseFloat(minPrice)) return false;
    if (maxPrice && product.price > parseFloat(maxPrice)) return false;
    return true;
  });
};

function ProductListContent() {
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ 
    page: 1, 
    pageSize: 3, 
    totalProducts: 0, 
    totalPages: 0 
  });

  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const provider = searchParams.get('provider');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;

  // Vytvoření cache klíče na základě parametrů
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      page,
      category,
      provider,
      minPrice,
      maxPrice
    });
  }, [page, category, provider, minPrice, maxPrice]);

  // Kontrola platnosti cache
  const isValidCache = useCallback((key: string) => {
    const cacheEntry = cache[key];
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      // Kontrola, zda už načítáme
      if (loading) return;

      setLoading(true);

      // Kontrola cache
      if (isValidCache(cacheKey)) {
        const cachedData = cache[cacheKey].data;
        setProducts(cachedData.products);
        setPagination(cachedData.pagination);
        setLoading(false);
        return;
      }

      // Vytvoření URL s parametry
      const url = new URL('/api/products', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('pageSize', page === 1 ? '3' : '9');
      if (category) url.searchParams.set('category', category);
      if (provider) url.searchParams.set('provider', provider);
      if (minPrice) url.searchParams.set('minPrice', minPrice);
      if (maxPrice) url.searchParams.set('maxPrice', maxPrice);

      // Načtení dat
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to load products');
      }

      const data: ProductsResponse = await response.json();

      // Uložení do cache
      cache[cacheKey] = {
        data,
        timestamp: Date.now()
      };

      setProducts(data.products);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  }, [page, category, provider, minPrice, maxPrice, cacheKey, isValidCache, loading]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = filterProducts(products, category, provider, minPrice, maxPrice);
  
  // Funkce pro vytvoření odkazů na stránkování
  const getPageLink = useCallback((pageNum: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageNum.toString());
    return url.toString();
  }, []);
  
  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => fetchProducts()} 
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Informace o počtu produktů */}
      <div className="text-center mb-6 text-gray-600">
        Found {pagination.totalProducts} products
      </div>

      {/* Seznam produktů */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Stránkování */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            {/* Previous Button */}
            {pagination.page > 1 && (
              <Link
                href={getPageLink(pagination.page - 1)}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                &laquo; Previous
              </Link>
            )}
            
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show max 5 pages
              const pagesToShow = 5;
              let startPage = Math.max(1, pagination.page - Math.floor(pagesToShow / 2));
              let endPage = Math.min(pagination.totalPages, startPage + pagesToShow - 1);
              
              // If we're at the end, adjust the start
              if (endPage - startPage + 1 < pagesToShow) {
                startPage = Math.max(1, endPage - pagesToShow + 1);
              }
              
              const pageNum = startPage + i;
              
              if (pageNum <= endPage) {
                return (
                  <Link
                    key={pageNum}
                    href={getPageLink(pageNum)}
                    className={`px-3 py-2 rounded ${
                      pageNum === pagination.page
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              }
              return null;
            })}
            
            {/* Next Button */}
            {pagination.page < pagination.totalPages && (
              <Link
                href={getPageLink(pagination.page + 1)}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                Next &raquo;
              </Link>
            )}
          </nav>
        </div>
      )}
      
      {/* Loading indicator for additional pages */}
      {loading && page > 1 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
      
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8">
          No products found matching the specified filters.
        </div>
      )}
    </div>
  );
}

const ProductCard = ({ product }: { product: AIProduct }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={800}
        height={450}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-bold">{product.price} €/month</span>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {product.category}
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Advantages:</h4>
          <ul className="list-disc list-inside text-green-600">
            {product.advantages.map((advantage, index) => (
              <li key={index}>{advantage}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Disadvantages:</h4>
          <ul className="list-disc list-inside text-red-600">
            {product.disadvantages.map((disadvantage, index) => (
              <li key={index}>{disadvantage}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between items-center pt-4">
          <Link
            href={product.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Try it
          </Link>
          {product.hasTrial && (
            <span className="text-green-500 font-semibold text-sm">Trial version available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProductList() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductListContent />
    </Suspense>
  );
} 
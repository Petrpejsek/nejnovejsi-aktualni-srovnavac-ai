'use client'

import React, { useState, useEffect } from 'react';
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

export default function ProductList() {
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ 
    page: 1, 
    pageSize: 30, 
    totalProducts: 0, 
    totalPages: 0 
  });
  const searchParams = useSearchParams();
  
  const category = searchParams.get('category');
  const provider = searchParams.get('provider');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Vytvoření URL s parametry
        const url = new URL('/api/products', window.location.origin);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('pageSize', '30');
        if (category) url.searchParams.set('category', category);
        
        // Načtení dat
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst produkty');
        }
        
        const data: ProductsResponse = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
        setLoading(false);
      } catch (err) {
        console.error('Chyba při načítání produktů:', err);
        setError(err instanceof Error ? err.message : 'Nastala chyba při načítání produktů');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [page, category]);
  
  const filteredProducts = filterProducts(products, category, provider, minPrice, maxPrice);
  
  if (loading && page === 1) return <div className="text-center py-8">Načítání produktů...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  
  // Funkce pro vytvoření odkazů na stránkování
  const getPageLink = (pageNum: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageNum.toString());
    return url.toString();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Stránkování */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            {/* Tlačítko Předchozí */}
            {pagination.page > 1 && (
              <Link
                href={getPageLink(pagination.page - 1)}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                &laquo; Předchozí
              </Link>
            )}
            
            {/* Čísla stránek */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Zobrazení max 5 stránek
              const pagesToShow = 5;
              let startPage = Math.max(1, pagination.page - Math.floor(pagesToShow / 2));
              let endPage = Math.min(pagination.totalPages, startPage + pagesToShow - 1);
              
              // Pokud jsme na konci, upravíme začátek
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
            
            {/* Tlačítko Další */}
            {pagination.page < pagination.totalPages && (
              <Link
                href={getPageLink(pagination.page + 1)}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                Další &raquo;
              </Link>
            )}
          </nav>
        </div>
      )}
      
      {/* Indikátor načítání pro další stránky */}
      {loading && page > 1 && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
      
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8">
          Nebyly nalezeny žádné produkty odpovídající zadaným filtrům.
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
        <span className="text-lg font-bold">{product.price} €/měsíc</span>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          {product.category}
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Výhody:</h4>
          <ul className="list-disc list-inside text-green-600">
            {product.advantages.map((advantage, index) => (
              <li key={index}>{advantage}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Nevýhody:</h4>
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
            <span className="text-green-500 font-semibold text-sm">Dostupná trial verze</span>
          )}
        </div>
      </div>
    </div>
  );
}; 
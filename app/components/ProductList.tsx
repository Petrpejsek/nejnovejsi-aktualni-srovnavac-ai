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
  const searchParams = useSearchParams();
  
  const category = searchParams.get('category');
  const provider = searchParams.get('provider');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst produkty');
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nastala chyba při načítání produktů');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const filteredProducts = filterProducts(products, category, provider, minPrice, maxPrice);
  
  if (loading) return <div className="text-center py-8">Načítání produktů...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4 md:px-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filteredProducts.length === 0 && (
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
            Vyzkoušet
          </Link>
          {product.hasTrial && (
            <span className="text-green-500 font-semibold text-sm">Dostupná trial verze</span>
          )}
        </div>
      </div>
    </div>
  );
}; 
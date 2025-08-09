// Server Component - Product Detail Page
import React from 'react';
import { notFound } from 'next/navigation';
import ProductDetail from '../../components/ProductDetail';
import { Container } from '@mui/material';

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props) {
  try {
    const product = await getProduct(params.id);
    return {
      title: `${product.name} | comparee.ai`,
      description: product.description,
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products/${params.id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Produkt nenalezen | comparee.ai',
      description: 'Požadovaný produkt nebyl nalezen.',
    };
  }
}

async function getProduct(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Nepodařilo se načíst produkt');
  }
  
  return response.json();
}

export default async function ProductPage({ params }: Props) {
  const productId = params.id;
  let product = null;
  
  try {
    product = await getProduct(productId);
  } catch (error) {
    // Product will be null, component will handle error
  }
  
  return (
    <Container maxWidth="lg">
      {product && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.name,
              "description": product.description,
              "url": `https://comparee.ai/products/${product.id}`,
              "brand": {
                "@type": "Brand",
                "name": "Comparee.ai"
              },
              "offers": {
                "@type": "Offer",
                "price": product.price || 0,
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              }
            })
          }}
        />
      )}
      <ProductDetail productId={parseInt(productId) || 0} />
    </Container>
  );
} 
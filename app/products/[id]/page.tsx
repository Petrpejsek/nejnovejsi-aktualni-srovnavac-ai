'use client'

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
    const product = await getProduct(parseInt(params.id));
    return {
      title: `${product.name} | FindAI`,
      description: product.description,
    };
  } catch (error) {
    return {
      title: 'Produkt nenalezen | FindAI',
      description: 'Požadovaný produkt nebyl nalezen.',
    };
  }
}

async function getProduct(id: number) {
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
  const productId = parseInt(params.id);
  
  return (
    <Container maxWidth="lg">
      <ProductDetail productId={productId} />
    </Container>
  );
} 
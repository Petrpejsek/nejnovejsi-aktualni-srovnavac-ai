// Server Component - Products List Page
import React from 'react';
import ProductList from '../components/ProductList';
import { Typography, Container } from '@mui/material';

export const metadata = {
  title: 'AI Produkty | comparee.ai',
  description: 'Prohlédněte si a porovnejte nejlepší AI nástroje na trhu.',
};

async function getProducts() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    next: {
      revalidate: 60 // Revalidace každou minutu
    }
  });
  
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst produkty');
  }
  
  return response.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 4, mb: 3 }}>
        AI Produkty
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Prohlédněte si a porovnejte nejlepší AI nástroje na trhu. Můžete filtrovat podle kategorie,
        poskytovatele nebo ceny a najít tak nástroj, který nejlépe vyhovuje vašim potřebám.
      </Typography>
      
      <ProductList initialProducts={products} />
    </Container>
  );
} 
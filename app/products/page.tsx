// Server Component - Products List Page
import React from 'react';
import { Container, Typography } from '@mui/material';
import ProductList from '../components/ProductList';

export const metadata = {
  title: 'AI Produkty | comparee.ai',
  description: 'Prohlédněte si a porovnejte nejlepší AI nástroje na trhu.',
};

export default function ProductsPage() {
  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" component="h1" gutterBottom className="text-center">
        Srovnání AI nástrojů
      </Typography>
      
      <ProductList />
    </Container>
  );
} 
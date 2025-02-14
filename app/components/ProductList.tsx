'use client'

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Rating,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CardMedia,
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface AIProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  provider: string;
  rating: number;
  features: string[];
  pros: string[];
  cons: string[];
  affiliate_link?: string;
  review_count: number;
  imageUrl: string;
}

interface ProductListProps {
  initialProducts?: AIProduct[];
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const router = useRouter();
  const [products, setProducts] = useState<AIProduct[]>(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtry
  const [category, setCategory] = useState('');
  const [provider, setProvider] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Načtení produktů
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/api/products?';
      
      if (category) url += `&category=${category}`;
      if (provider) url += `&provider=${provider}`;
      if (minPrice) url += `&min_price=${minPrice}`;
      if (maxPrice) url += `&max_price=${maxPrice}`;
      
      const response = await fetch(url, {
        next: {
          revalidate: 60
        }
      });
      if (!response.ok) throw new Error('Nepodařilo se načíst produkty');
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Chyba při načítání produktů');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Použijeme useMemo pro filtrované produkty
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (category && product.category !== category) return false;
      if (provider && !product.tags.includes(provider)) return false;
      if (minPrice && product.price < parseFloat(minPrice)) return false;
      if (maxPrice && product.price > parseFloat(maxPrice)) return false;
      return true;
    });
  }, [products, category, provider, minPrice, maxPrice]);
  
  useEffect(() => {
    if (!initialProducts) {
      fetchProducts();
    }
  }, [category, provider, minPrice, maxPrice]);
  
  // Handlery pro filtry
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };
  
  const handleProviderChange = (event: SelectChangeEvent) => {
    setProvider(event.target.value);
  };
  
  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(event.target.value);
  };
  
  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(event.target.value);
  };
  
  if (loading) return <Typography>Načítání...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Filtry */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Kategorie</InputLabel>
              <Select value={category} onChange={handleCategoryChange}>
                <MenuItem value="">Všechny</MenuItem>
                <MenuItem value="chatbot">Chatbot</MenuItem>
                <MenuItem value="image">Generování obrázků</MenuItem>
                <MenuItem value="code">Programování</MenuItem>
                <MenuItem value="text">Zpracování textu</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Poskytovatel</InputLabel>
              <Select value={provider} onChange={handleProviderChange}>
                <MenuItem value="">Všichni</MenuItem>
                <MenuItem value="OpenAI">OpenAI</MenuItem>
                <MenuItem value="Google">Google</MenuItem>
                <MenuItem value="Anthropic">Anthropic</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Min. cena"
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Max. cena"
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Seznam produktů */}
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={product.imageUrl}
                alt={product.name}
                loading="lazy"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 
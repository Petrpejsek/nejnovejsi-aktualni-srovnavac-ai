'use client'

import React, { useState, useEffect } from 'react';
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
}

interface ProductListProps {
  initialProducts?: AIProduct[];
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const router = useRouter();
  const [products, setProducts] = useState<AIProduct[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
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
      
      const response = await fetch(url);
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
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {product.name}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip label={product.category} color="primary" size="small" sx={{ mr: 1 }} />
                  <Chip label={product.provider} size="small" />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Rating value={product.rating} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary">
                    ({product.review_count} hodnocení)
                  </Typography>
                </Box>
                
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                  {product.price} Kč/měsíc
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Hlavní funkce:</Typography>
                  {product.features.slice(0, 3).map((feature, index) => (
                    <Typography key={index} variant="body2">• {feature}</Typography>
                  ))}
                </Box>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  Zobrazit detail
                </Button>
                {product.affiliate_link && (
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 1 }}
                    href={product.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vyzkoušet
                  </Button>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 
'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Rating,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
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

interface ComparisonPoint {
  aspect: string;
  product1?: any;
  product2?: any;
  winner?: string;
  explanation?: string;
  details?: string[];
  type?: 'list';
}

interface ComparisonResult {
  product1: AIProduct;
  product2: AIProduct;
  comparison_points: ComparisonPoint[];
  recommendation: string;
}

interface ProductComparisonProps {
  initialProduct1Id?: number;
  initialProduct2Id?: number;
}

export default function ProductComparison({
  initialProduct1Id,
  initialProduct2Id
}: ProductComparisonProps) {
  const router = useRouter();
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [selectedProduct1Id, setSelectedProduct1Id] = useState<number | ''>('');
  const [selectedProduct2Id, setSelectedProduct2Id] = useState<number | ''>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Načtení všech produktů
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Nepodařilo se načíst produkty');
        const data = await response.json();
        setProducts(data);
        
        // Nastavení výchozích hodnot
        if (initialProduct1Id) setSelectedProduct1Id(initialProduct1Id);
        if (initialProduct2Id) setSelectedProduct2Id(initialProduct2Id);
      } catch (err) {
        setError('Error loading products');
        console.error(err);
      }
    };
    
    fetchProducts();
  }, [initialProduct1Id, initialProduct2Id]);
  
  // Porovnání produktů
  const compareProducts = async () => {
    if (!selectedProduct1Id || !selectedProduct2Id) {
      setError('Vyberte oba produkty pro porovnání');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `/api/compare/${selectedProduct1Id}/${selectedProduct2Id}`
      );
      
      if (!response.ok) throw new Error('Nepodařilo se porovnat produkty');
      
      const result = await response.json();
      setComparisonResult(result);
    } catch (err) {
              setError('Error comparing products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handlery pro výběr produktů
  const handleProduct1Change = (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    setSelectedProduct1Id(isNaN(value) ? '' : value);
    if (value === selectedProduct2Id) {
      setSelectedProduct2Id('');
    }
  };
  
  const handleProduct2Change = (event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    setSelectedProduct2Id(isNaN(value) ? '' : value);
    if (value === selectedProduct1Id) {
      setSelectedProduct1Id('');
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Výběr produktů */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel>První produkt</InputLabel>
                <Select
                  value={selectedProduct1Id}
                  onChange={handleProduct1Change}
                  label="První produkt"
                >
                  <MenuItem value="">
                    <em>Vyberte produkt</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem
                      key={product.id}
                      value={product.id}
                      disabled={product.id === selectedProduct2Id}
                    >
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={2} sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h5">VS</Typography>
            </Grid>
            
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel>Druhý produkt</InputLabel>
                <Select
                  value={selectedProduct2Id}
                  onChange={handleProduct2Change}
                  label="Druhý produkt"
                >
                  <MenuItem value="">
                    <em>Vyberte produkt</em>
                  </MenuItem>
                  {products.map((product) => (
                    <MenuItem
                      key={product.id}
                      value={product.id}
                      disabled={product.id === selectedProduct1Id}
                    >
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={compareProducts}
              disabled={!selectedProduct1Id || !selectedProduct2Id || loading}
            >
              {loading ? 'Porovnávám...' : 'Porovnat produkty'}
            </Button>
          </Box>
          
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
      
      {/* Výsledky porovnání */}
      {comparisonResult && (
        <Grid container spacing={3}>
          {/* Základní informace */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Doporučení
                </Typography>
                <Typography paragraph>
                  {comparisonResult.recommendation}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Detailní porovnání */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Detailní porovnání
                </Typography>
                
                {comparisonResult.comparison_points.map((point, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {point.aspect}
                    </Typography>
                    
                    {point.type === 'list' ? (
                      <List>
                        {point.details?.map((detail, detailIndex) => (
                          <ListItem key={detailIndex}>
                            <ListItemText primary={detail} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={5}>
                            <Typography>
                              {comparisonResult.product1.name}: {point.product1}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                            <Typography>vs</Typography>
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <Typography>
                              {comparisonResult.product2.name}: {point.product2}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        {point.winner && (
                          <Typography sx={{ mt: 1, color: 'success.main' }}>
                            Vítěz: {point.winner} - {point.explanation}
                          </Typography>
                        )}
                      </>
                    )}
                    
                    {index < comparisonResult.comparison_points.length - 1 && (
                      <Divider sx={{ mt: 2 }} />
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Odkazy na produkty */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => router.push(`/products/${comparisonResult.product1.id}`)}
                    >
                      Zobrazit detail {comparisonResult.product1.name}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => router.push(`/products/${comparisonResult.product2.id}`)}
                    >
                      Zobrazit detail {comparisonResult.product2.name}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
} 
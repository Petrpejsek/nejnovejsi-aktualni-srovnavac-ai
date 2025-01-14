'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Rating,
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

interface Recommendation {
  products: AIProduct[];
  reasoning: string;
}

export default function ProductRecommendation() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  
  // Přidání nového požadavku
  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };
  
  // Odstranění požadavku
  const removeRequirement = (index: number) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
  };
  
  // Aktualizace požadavku
  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };
  
  // Změna kategorie
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };
  
  // Změna rozpočtu
  const handleBudgetChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBudget(event.target.value);
  };
  
  // Získání doporučení
  const getRecommendations = async () => {
    // Validace
    if (requirements.some(req => !req.trim())) {
      setError('Vyplňte všechny požadavky');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_requirements: requirements.filter(req => req.trim()),
          category: category || undefined,
          budget: budget ? parseFloat(budget) : undefined,
        }),
      });
      
      if (!response.ok) throw new Error('Nepodařilo se získat doporučení');
      
      const result = await response.json();
      setRecommendation(result);
    } catch (err) {
      setError('Chyba při získávání doporučení');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Formulář pro požadavky */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Co hledáte?
          </Typography>
          
          <Grid container spacing={2}>
            {/* Požadavky */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Vaše požadavky
              </Typography>
              {requirements.map((requirement, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Požadavek ${index + 1}`}
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    error={!requirement.trim()}
                    helperText={!requirement.trim() && 'Vyplňte požadavek'}
                  />
                  {requirements.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeRequirement(index)}
                    >
                      Odebrat
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={addRequirement}
                sx={{ mt: 1 }}
              >
                Přidat další požadavek
              </Button>
            </Grid>
            
            {/* Kategorie */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kategorie (volitelné)</InputLabel>
                <Select
                  value={category}
                  onChange={handleCategoryChange}
                  label="Kategorie (volitelné)"
                >
                  <MenuItem value="">
                    <em>Všechny kategorie</em>
                  </MenuItem>
                  <MenuItem value="chatbot">Chatbot</MenuItem>
                  <MenuItem value="image">Generování obrázků</MenuItem>
                  <MenuItem value="code">Programování</MenuItem>
                  <MenuItem value="text">Zpracování textu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Rozpočet */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximální rozpočet (Kč/měsíc, volitelné)"
                type="number"
                value={budget}
                onChange={handleBudgetChange}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={getRecommendations}
              disabled={loading}
              size="large"
            >
              {loading ? 'Hledám nejlepší řešení...' : 'Získat doporučení'}
            </Button>
          </Box>
          
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
      
      {/* Výsledky doporučení */}
      {recommendation && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Naše doporučení
              </Typography>
              <Typography paragraph>
                {recommendation.reasoning}
              </Typography>
            </CardContent>
          </Card>
          
          <Grid container spacing={3}>
            {recommendation.products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {product.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip label={product.category} color="primary" sx={{ mr: 1 }} />
                      <Chip label={product.provider} />
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
        </>
      )}
    </Box>
  );
} 
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useSession } from 'next-auth/react';

interface Review {
  id: number;
  rating: number;
  comment: string;
  pros?: string[];
  cons?: string[];
  user_id: number;
  created_at: string;
}

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
  hasTrial?: boolean;
}

interface ProductDetailProps {
  productId: number;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const { data: session } = useSession();
  const [product, setProduct] = useState<AIProduct | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    pros: [''],
    cons: ['']
  });
  
  // Načtení produktu a recenzí
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Načtení produktu
        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) throw new Error('Nepodařilo se načíst produkt');
        const productData = await productResponse.json();
        setProduct(productData);
        
        // Načtení recenzí
        const reviewsResponse = await fetch(`/api/products/${productId}/reviews`);
        if (!reviewsResponse.ok) throw new Error('Nepodařilo se načíst recenze');
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      } catch (err) {
        setError('Chyba při načítání dat');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);
  
  // Přidání recenze
  const handleAddReview = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReview,
          product_id: productId,
        }),
      });
      
      if (!response.ok) throw new Error('Nepodařilo se přidat recenzi');
      
      const addedReview = await response.json();
      setReviews([...reviews, addedReview]);
      setReviewDialogOpen(false);
      setNewReview({ rating: 0, comment: '', pros: [''], cons: [''] });
    } catch (err) {
      console.error('Chyba při přidávání recenze:', err);
    }
  };
  
  // Uložení produktu
  const handleSaveProduct = async () => {
    if (!product) return;
    
    // Start animation
    setIsAnimating(true);
    
    try {
      const response = await fetch('/api/users/saved-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id.toString(),
          productName: product.name,
          category: product.category,
          imageUrl: null, // Zatím bez obrázku
          price: product.price
        }),
      });
      
      if (response.ok) {
        // Show success toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else if (response.status === 409) {
        // Show already saved toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        alert('Chyba při ukládání produktu.');
      }
    } catch (err) {
      console.error('Chyba při ukládání produktu:', err);
      alert('Chyba při ukládání produktu.');
    } finally {
      // End animation
      setTimeout(() => setIsAnimating(false), 300);
    }
  };
  
  if (loading) return <Typography>Načítání...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!product) return <Typography>Produkt nenalezen</Typography>;
  
  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Produkt uložen!</span>
          </div>
        </div>
      )}
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Detail produktu */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {product.name}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip label={product.category} color="primary" sx={{ mr: 1 }} />
                  <Chip label={product.provider} />
                  {product.hasTrial && (
                    <Chip 
                      label="Free Trial" 
                      color="success" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Rating value={product.rating} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary">
                    ({product.review_count} hodnocení)
                  </Typography>
                </Box>
                
                <Typography variant="h5" color="primary" sx={{ mb: 3 }}>
                  ${product.price}/měsíc
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {product.description}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                {/* Funkce */}
                <Typography variant="h6" gutterBottom>
                  Funkce
                </Typography>
                <List>
                  {product.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {/* Výhody */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Výhody
                    </Typography>
                    <List>
                      {product.pros.map((pro, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`+ ${pro}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  {/* Nevýhody */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="error.main" gutterBottom>
                      Nevýhody
                    </Typography>
                    <List>
                      {product.cons.map((con, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`- ${con}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  {product.affiliate_link && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      href={product.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vyzkoušet
                    </Button>
                  )}
                  {session && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => handleSaveProduct()}
                      className={isAnimating ? 'animate-pulse transform -translate-y-1' : ''}
                      sx={{ 
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      Save Product
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recenze */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recenze
                  </Typography>
                  {session && (
                    <Button
                      variant="contained"
                      onClick={() => setReviewDialogOpen(true)}
                    >
                      Přidat recenzi
                    </Button>
                  )}
                </Box>
                
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Box key={review.id} sx={{ mb: 3 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" paragraph>
                        {review.comment}
                      </Typography>
                      
                      {review.pros && review.pros.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="success.main">
                            Výhody:
                          </Typography>
                          <List dense>
                            {review.pros.map((pro, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={`+ ${pro}`} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      {review.cons && review.cons.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="error.main">
                            Nevýhody:
                          </Typography>
                          <List dense>
                            {review.cons.map((con, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={`- ${con}`} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      <Divider />
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    Zatím žádné recenze
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Dialog pro přidání recenze */}
        <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
          <DialogTitle>Přidat recenzi</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Hodnocení</Typography>
              <Rating
                value={newReview.rating}
                onChange={(_, value) => setNewReview({ ...newReview, rating: value || 0 })}
              />
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Komentář"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              sx={{ mt: 2 }}
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Výhody</Typography>
              {newReview.pros.map((pro, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={pro}
                    onChange={(e) => {
                      const newPros = [...newReview.pros];
                      newPros[index] = e.target.value;
                      setNewReview({ ...newReview, pros: newPros });
                    }}
                  />
                  <Button
                    onClick={() => {
                      const newPros = newReview.pros.filter((_, i) => i !== index);
                      setNewReview({ ...newReview, pros: newPros });
                    }}
                  >
                    Odebrat
                  </Button>
                </Box>
              ))}
              <Button
                onClick={() => setNewReview({
                  ...newReview,
                  pros: [...newReview.pros, '']
                })}
              >
                Přidat výhodu
              </Button>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>Nevýhody</Typography>
              {newReview.cons.map((con, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={con}
                    onChange={(e) => {
                      const newCons = [...newReview.cons];
                      newCons[index] = e.target.value;
                      setNewReview({ ...newReview, cons: newCons });
                    }}
                  />
                  <Button
                    onClick={() => {
                      const newCons = newReview.cons.filter((_, i) => i !== index);
                      setNewReview({ ...newReview, cons: newCons });
                    }}
                  >
                    Odebrat
                  </Button>
                </Box>
              ))}
              <Button
                onClick={() => setNewReview({
                  ...newReview,
                  cons: [...newReview.cons, '']
                })}
              >
                Přidat nevýhodu
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Zrušit</Button>
            <Button onClick={handleAddReview} variant="contained">
              Přidat recenzi
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
} 
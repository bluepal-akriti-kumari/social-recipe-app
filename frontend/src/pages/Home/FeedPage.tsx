import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import type { AppDispatch, RootState } from '../../store/store';
import { getExploreFeedThunk, likeRecipeThunk } from '../../features/recipes/recipeThunks';
import { resetRecipes, fetchStart, fetchExploreSuccess, fetchFailure } from '../../features/recipes/recipeSlice';
import RecipeCard from '../../components/recipes/RecipeCard';
import { recipeService } from '../../services/recipe.service';

const FeedPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { exploreFeed, loading, error, nextCursor } = useSelector(
    (state: RootState) => state.recipes
  );

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');

  // Initial Fetch: Reset and load first batch
  useEffect(() => {
    const initFetch = async () => {
      dispatch(resetRecipes()); // Clear previous state
      if (searchQuery) {
        dispatch(fetchStart());
        try {
          const data = await recipeService.searchRecipes(searchQuery);
          // Search returns List, we wrap it to fit the success action
          dispatch(fetchExploreSuccess({ content: data, nextCursor: '' }));
        } catch (err: any) {
          dispatch(fetchFailure(err.response?.data || 'Search failed'));
        }
      } else {
        dispatch(getExploreFeedThunk()); // Load explore feed
      }
    };
    initFetch();
  }, [dispatch, searchQuery]);

  // Infinite Scroll Logic
  const handleScroll = useCallback(() => {
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
    
    // Only fetch if we have a cursor, are at the bottom, and not currently loading
    if (isAtBottom && !loading && nextCursor && !searchQuery) {
      dispatch(getExploreFeedThunk(nextCursor));
    }
  }, [loading, nextCursor, searchQuery, dispatch]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleLike = (id: number) => {
    dispatch(likeRecipeThunk(id));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} sx={{ 
          background: 'linear-gradient(45deg, #ef4444 30%, #f97316 90%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1
        }}>
          {searchQuery ? `Search: ${searchQuery}` : 'Explore Recipes'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 4 
        }}
      >
        {exploreFeed.map((recipe, index) => (
          <RecipeCard 
            // FIX: Using composite key (ID + Index) to ensure absolute uniqueness
            key={`${recipe.id}-${index}`} 
            recipe={recipe} 
            onLike={handleLike} 
          />
        ))}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {!loading && exploreFeed.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary">
            No recipes found.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default FeedPage;
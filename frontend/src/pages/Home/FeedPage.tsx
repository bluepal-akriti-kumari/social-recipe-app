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
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontSize: { xs: '2.5rem', md: '3.75rem' },
            fontWeight: 900,
            mb: 2,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {searchQuery ? (
            <>Search Results for <span className="text-gradient">"{searchQuery}"</span></>
          ) : (
            <>Discover Your Next <span className="text-gradient">Masterpiece</span></>
          )}
        </Typography>
        {!searchQuery && (
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
            Join our community of food lovers and share your culinary adventures with the world.
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)' 
          },
          gap: { xs: 3, md: 4 } 
        }}
      >
        {exploreFeed.map((recipe, index) => (
          <Box key={`${recipe.id}-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <RecipeCard 
              recipe={recipe} 
              onLike={handleLike} 
            />
          </Box>
        ))}
      </Box>

      {(loading || nextCursor) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          {loading ? (
            <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
          ) : (
            <Typography color="text.secondary" fontWeight={600}>
              Scroll for more deliciousness...
            </Typography>
          )}
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
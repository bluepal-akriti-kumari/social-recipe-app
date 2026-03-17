import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppDispatch, RootState } from '../../store/store';
import { getExploreFeedThunk, likeRecipeThunk } from '../../features/recipes/recipeThunks';
import { resetRecipes, fetchStart, fetchExploreSuccess, fetchFailure } from '../../features/recipes/recipeSlice';
import RecipeCard from '../../components/recipes/RecipeCard';
import HeroCarousel from '../../components/home/HeroCarousel';
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
    <Box sx={{ minHeight: '100vh', pt: { xs: 4, md: 6 }, pb: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        {/* Only show Carousel on non-search Explore feed */}
        {!searchQuery && exploreFeed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <HeroCarousel recipes={exploreFeed} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.165, 0.84, 0.44, 1] }}
        >
          <Box sx={{ mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 900,
                mb: 2,
                letterSpacing: '-0.05em',
                lineHeight: 1.1,
                color: 'primary.main'
              }}
            >
              {searchQuery ? (
                <>Results for <span style={{ color: '#E67E22' }}>"{searchQuery}"</span></>
              ) : (
                <>Elevate Your <br/><span style={{ color: '#E67E22' }}>Culinary Journey</span></>
              )}
            </Typography>
            {!searchQuery && (
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  maxWidth: 800, 
                  mx: 'auto', 
                  fontWeight: 500, 
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  lineHeight: 1.6,
                  opacity: 0.8
                }}
              >
                Explore expert recipes, master new techniques, and share your passion with a professional community.
              </Typography>
            )}
          </Box>
        </motion.div>

        {error && (
          <Alert 
            severity="error" 
            variant="outlined" 
            sx={{ mb: 6, borderRadius: 4, bgcolor: 'rgba(254, 242, 242, 0.6)', backdropFilter: 'blur(10px)' }}
          >
            {error}
          </Alert>
        )}

        <AnimatePresence mode="popLayout">
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)' 
              },
              gap: { xs: 3, md: 5 } 
            }}
          >
            {exploreFeed.map((recipe, index) => (
              <motion.div
                key={`${recipe.id}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index % 8) * 0.1 }}
                layout
              >
                <RecipeCard 
                  recipe={recipe} 
                  onLike={handleLike} 
                />
              </motion.div>
            ))}
          </Box>
        </AnimatePresence>

        {(loading || nextCursor) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            {loading ? (
              <Box sx={{ position: 'relative', display: 'flex' }}>
                <CircularProgress size={48} thickness={5} sx={{ color: 'primary.main' }} />
                <CircularProgress 
                  size={48} 
                  thickness={5} 
                  sx={{ 
                    color: 'primary.light', 
                    position: 'absolute', 
                    left: 0, 
                    opacity: 0.3 
                  }} 
                  variant="determinate" 
                  value={100} 
                />
              </Box>
            ) : (
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>
                Discovering more...
              </Typography>
            )}
          </Box>
        )}

        {!loading && exploreFeed.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 15, borderRadius: 8, border: '2px dashed rgba(226, 232, 240, 0.8)' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              No culinary treasures found.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default FeedPage;
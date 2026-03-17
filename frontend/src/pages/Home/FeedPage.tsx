import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import RecipeCard from '../../components/recipes/RecipeCard';
import HeroCarousel from '../../components/home/HeroCarousel';
import CommunitySidebar from '../../components/home/CommunitySidebar';
import { recipeService } from '../../services/recipe.service';

const FeedPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');

  // --- Search Results (Static Query) ---
  const { 
    data: searchData, 
    isLoading: isSearchLoading, 
    error: searchError 
  } = useQuery({
    queryKey: ['recipes', 'search', searchQuery],
    queryFn: () => recipeService.searchRecipes(searchQuery!),
    enabled: !!searchQuery,
  });

  // --- Explore Feed (Infinite Query) ---
  const {
    data: exploreData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isExploreLoading,
    error: exploreError,
  } = useInfiniteQuery({
    queryKey: ['recipes', 'explore'],
    queryFn: ({ pageParam }) => recipeService.getExploreFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !searchQuery,
  });

  // Flatten explore recipes
  const exploreFeed = useMemo(() => 
    exploreData?.pages.flatMap(page => page.content) || [], 
    [exploreData]
  );

  // --- Scroll Listener for Infinite Scroll ---
  useEffect(() => {
    if (searchQuery) return;

    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;
      if (isAtBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, searchQuery]);

  const handleLike = (id: number) => {
    // In a full React Query implementation, we'd use useMutation and queryClient.invalidateQueries
    // For now, let's just trigger the service call and then invalidate
    recipeService.likeRecipe(id).then(() => {
      // Logic for optimistic update or invalidation
    });
  };

  const currentLoading = searchQuery ? isSearchLoading : isExploreLoading;
  const currentError = searchQuery ? (searchError as any)?.message : (exploreError as any)?.message;
  const displayFeed = searchQuery ? (searchData || []) : exploreFeed;

  return (
    <Box sx={{ minHeight: '100vh', pt: { xs: 4, md: 6 }, pb: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        {!searchQuery && displayFeed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <HeroCarousel recipes={displayFeed.slice(0, 5)} />
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
                  maxWidth: 800, mx: 'auto', fontWeight: 500, 
                  fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.6, opacity: 0.8
                }}
              >
                Explore expert recipes, master new techniques, and share your passion with a professional community.
              </Typography>
            )}
          </Box>
        </motion.div>

        {currentError && (
          <Alert 
            severity="error" 
            variant="outlined" 
            sx={{ mb: 6, borderRadius: 4, bgcolor: 'rgba(254, 242, 242, 0.6)', backdropFilter: 'blur(10px)' }}
          >
            {currentError}
          </Alert>
        )}

        <Grid container spacing={5}>
          <Grid item xs={12} lg={searchQuery ? 12 : 8.5}>
            <AnimatePresence mode="popLayout">
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    sm: 'repeat(2, 1fr)', 
                    md: searchQuery ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                    lg: searchQuery ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                    xl: searchQuery ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'
                  },
                  gap: { xs: 3, md: 5 } 
                }}
              >
                {displayFeed.map((recipe, index) => (
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

            {currentLoading || isFetchingNextPage ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={48} thickness={5} sx={{ color: 'primary.main' }} />
              </Box>
            ) : hasNextPage && !searchQuery ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                 <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>
                  Discovering more...
                </Typography>
              </Box>
            ) : null}

            {!currentLoading && displayFeed.length === 0 && !currentError && (
              <Box sx={{ textAlign: 'center', py: 15, borderRadius: 8, border: '2px dashed rgba(226, 232, 240, 0.8)' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                  No culinary treasures found.
                </Typography>
              </Box>
            )}
          </Grid>

          {!searchQuery && (
            <Grid item lg={3.5} sx={{ display: { xs: 'none', lg: 'block' } }}>
              <CommunitySidebar />
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeedPage;
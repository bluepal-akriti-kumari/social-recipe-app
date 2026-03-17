import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Container, Box, Typography, Avatar, 
  Button, Paper, Tabs, Tab, CircularProgress, 
  Alert
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import VerifiedIcon from '@mui/icons-material/Verified';
import { motion } from 'framer-motion';
import { recipeService } from '../../services/recipe.service';
import type { RecipeSummary } from '../../services/recipe.service';
import RecipeCard from '../../components/recipes/RecipeCard';
import EditProfileModal from '../../components/profile/EditProfileModal';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- Data Fetching (React Query) ---
  const { 
    data: profile, 
    isLoading: isProfileLoading, 
    error: profileError 
  } = useQuery({
    queryKey: ['profiles', username],
    queryFn: () => api.get(`/users/${username}`).then(res => res.data),
    enabled: !!username,
  });

  const { 
    data: recipes = [], 
    isLoading: isRecipesLoading 
  } = useQuery({
    queryKey: ['profiles', username, 'recipes', activeTab],
    queryFn: () => activeTab === 0 
      ? recipeService.getUserRecipes(username!) 
      : recipeService.getUserLikedRecipes(username!),
    enabled: !!username && !!profile,
  });

  // --- Mutations ---
  const followMutation = useMutation({
    mutationFn: () => profile?.isFollowing 
      ? api.delete(`/users/${username}/follow`) 
      : api.post(`/users/${username}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', username] });
    },
  });

  const handleFollowToggle = () => followMutation.mutate();

  const likeMutation = useMutation({
    mutationFn: (id: number) => recipeService.likeRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', username, 'recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: () => toast.error('Failed to update like'),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (id: number) => recipeService.bookmarkRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', username, 'recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: () => toast.error('Failed to update bookmark'),
  });

  const handleLike = (id: number) => likeMutation.mutate(id);
  const handleBookmark = (id: number) => bookmarkMutation.mutate(id);

  if (isProfileLoading && !profile) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  if (profileError || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">{(profileError as any)?.message || 'User not found'}</Alert>
      </Container>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <Box className="bg-mesh" sx={{ minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Paper 
          className="glass-card"
          sx={{ 
            p: 0, 
            borderRadius: 3, 
            mb: 6, 
            position: 'relative', 
            overflow: 'hidden',
          }}
        >
          {/* Cover Photo Area with Parallax Effect Placeholder */}
          <Box sx={{ position: 'relative', height: { xs: 240, md: 380 }, overflow: 'hidden' }}>
            {profile.coverPictureUrl ? (
              <Box 
                component="img" 
                src={profile.coverPictureUrl} 
                sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'scale(1.08)' } }} 
              />
            ) : (
              <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', opacity: 0.9 }} />
            )}
            <Box className="card-overlay" />
          </Box>
          
          <Box sx={{ 
            px: { xs: 3, md: 6 }, 
            pb: { xs: 4, md: 6 },
            mt: { xs: -8, md: -12 },
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-end' },
            gap: { xs: 4, md: 6 }
          }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={profile.profilePictureUrl} 
                sx={{ 
                  width: { xs: 140, md: 180 }, 
                  height: { xs: 140, md: 180 }, 
                  border: '6px solid white', 
                  boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
                  fontSize: '4rem',
                  fontWeight: 950,
                  bgcolor: 'primary.main',
                  color: 'white'
                }}
              >
                {profile.username[0].toUpperCase()}
              </Avatar>
              {profile.isVerified && (
                <Box 
                  sx={{ 
                    position: 'absolute', bottom: 25, right: 15, 
                    width: 44, height: 44, 
                    bgcolor: 'white', 
                    borderRadius: '50%', 
                    border: '5px solid white', 
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}
                >
                  <VerifiedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                </Box>
              )}
            </Box>
            
            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.04em', color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {profile.username}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {profile.reputationLevel || 'Executive Chef'} • {profile.reputationPoints || 1250} Rep
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {isOwnProfile ? (
                    <Button 
                      variant="outlined" 
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditModalOpen(true)}
                      sx={{ 
                        borderRadius: 2, 
                        px: 3, 
                        py: 1,
                        color: 'text.primary', 
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }, 
                        boxShadow: 'none' 
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button 
                      variant={profile.isFollowing ? "outlined" : "contained"} 
                      onClick={handleFollowToggle}
                      disabled={followMutation.isPending}
                      sx={{ 
                        px: 4, 
                        py: 1,
                        borderRadius: 2, 
                        fontWeight: 900, 
                        minWidth: 120,
                        textTransform: 'none',
                        boxShadow: (profile.isFollowing || followMutation.isPending) ? 'none' : '0 8px 16px rgba(99, 102, 241, 0.2)'
                      }}
                    >
                      {followMutation.isPending ? 'Processing...' : (profile.isFollowing ? 'Following' : 'Follow')}
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 4, maxWidth: 650, mx: { xs: 'auto', md: 0 }, fontSize: '1.25rem', lineHeight: 1.6, letterSpacing: '0.01em' }}>
                {profile.bio || 'Passion for good food and community. Sharing my culinary journey one recipe at a time! 🍳✨'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: { xs: 3, md: 5 }, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 950 }}>{profile.followerCount}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Followers</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 950 }}>{profile.followingCount}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Following</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 950 }}>{recipes.length}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipes</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ p: 0.5, borderRadius: 2.5, display: 'inline-flex', bgcolor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, val) => setActiveTab(val)} 
              sx={{ 
                minHeight: 0,
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': { 
                  minHeight: 40, 
                  px: { xs: 3, sm: 6 }, 
                  borderRadius: 2, 
                  fontSize: '0.9rem', 
                  fontWeight: 900,
                  color: 'text.secondary',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': { 
                    color: 'white', 
                    bgcolor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(44, 62, 80, 0.2)' 
                  }
                }
              }}
            >
              <Tab label="Collection" disableRipple />
              <Tab label="Liked" disableRipple />
            </Tabs>
          </Box>
        </Box>

        {isRecipesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
            <Box sx={{ position: 'relative', display: 'flex' }}>
              <CircularProgress size={60} thickness={4} sx={{ color: 'rgba(99, 102, 241, 0.1)' }} />
              <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main', position: 'absolute', left: 0, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
            </Box>
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 5
            }}
          >
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => (
                <motion.div 
                  key={recipe.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <RecipeCard 
                    recipe={recipe} 
                    onLike={handleLike} 
                    onBookmark={handleBookmark}
                  />
                </motion.div>
              ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 20 }}>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.03)', p: 4, borderRadius: '50%', display: 'inline-flex', mb: 3 }}>
                  <RestaurantMenuIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                </Box>
                <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 950, mb: 2, letterSpacing: '-0.02em' }}>
                  {activeTab === 0 ? "Empty Culinary Canvas" : "No Treasures Discovered"}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6, maxWidth: 450, mx: 'auto', fontSize: '1.1rem', fontWeight: 500 }}>
                  Every great chef starts with a blank slate. Begin your journey by sharing your first masterpiece.
                </Typography>
                <Button 
                  variant="contained" 
                  size="medium"
                  onClick={() => navigate('/feed')}
                  sx={{ 
                    borderRadius: 2, 
                    px: 4, 
                    py: 1.5, 
                    fontWeight: 900,
                    boxShadow: '0 8px 16px rgba(44, 62, 80, 0.15)',
                    textTransform: 'none',
                  }}
                >
                  Discover Inspiration
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Container>

      {profile && (
        <EditProfileModal 
          open={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          profile={profile}
        />
      )}
    </Box>
  );
};

export default ProfilePage;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, Box, Typography, Avatar, Button, 
  Paper, Tabs, Tab, CircularProgress, 
  Alert, alpha 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { AppDispatch, RootState } from '../../store/store';
import { getProfileThunk, followUserThunk, unfollowUserThunk } from '../../features/user/userThunks';
import { recipeService } from '../../services/recipe.service';
import type { RecipeSummary } from '../../services/recipe.service';
import RecipeCard from '../../components/recipes/RecipeCard';
import EditProfileModal from '../../components/profile/EditProfileModal';
import { useAuth } from '../../hooks/useAuth';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useAuth();
  const { profile, loading, error } = useSelector((state: RootState) => state.user);
  
  const [activeTab, setActiveTab] = useState(0);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (username) {
      dispatch(getProfileThunk(username));
    }
  }, [username, dispatch]);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!username) return;
      setRecipesLoading(true);
      try {
        const data = activeTab === 0 
          ? await recipeService.getUserRecipes(username)
          : await recipeService.getUserLikedRecipes(username);
        setRecipes(data);
      } catch (err) {
        console.error('Failed to fetch recipes', err);
      } finally {
        setRecipesLoading(false);
      }
    };

    fetchRecipes();
  }, [username, activeTab]);

  const handleFollowToggle = () => {
    if (!username || !profile) return;
    if (profile.isFollowing) {
      dispatch(unfollowUserThunk(username));
    } else {
      dispatch(followUserThunk(username));
    }
  };

  if (loading && !profile) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  if (error || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">{error || 'User not found'}</Alert>
      </Container>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 0, 
          borderRadius: 8, 
          mb: 6, 
          position: 'relative', 
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'white',
          boxShadow: '0 20px 50px rgba(0,0,0,0.04)'
        }}
      >
        {/* Cover Photo Area */}
        <Box sx={{ position: 'relative', height: { xs: 200, md: 300 }, overflow: 'hidden' }}>
          {profile.coverPictureUrl ? (
            <Box 
              component="img" 
              src={profile.coverPictureUrl} 
              sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.05)' } }} 
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', opacity: 0.9 }} />
          )}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />
        </Box>
        
        <Box sx={{ 
          px: { xs: 3, md: 6 }, 
          pb: { xs: 4, md: 6 },
          mt: { xs: -8, md: -10 },
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-end' },
          gap: { xs: 3, md: 5 }
        }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={profile.profilePictureUrl} 
              sx={{ 
                width: { xs: 140, md: 180 }, 
                height: { xs: 140, md: 180 }, 
                border: '8px solid white', 
                boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
                fontSize: '4.5rem',
                fontWeight: 900,
                background: 'white'
              }}
            >
              {profile.username[0].toUpperCase()}
            </Avatar>
            <Box sx={{ position: 'absolute', bottom: 20, right: 10, width: 24, height: 24, bgcolor: '#22c55e', borderRadius: '50%', border: '4px solid white', zIndex: 2 }} />
          </Box>
          
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.03em', color: { xs: 'text.primary', md: 'text.primary' } }}>
                {profile.username}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {isOwnProfile ? (
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditModalOpen(true)}
                    sx={{ borderRadius: 3, px: 3, bgcolor: '#f1f5f9', color: 'text.primary', '&:hover': { bgcolor: '#e2e8f0' }, boxShadow: 'none' }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    variant={profile.isFollowing ? "outlined" : "contained"} 
                    onClick={handleFollowToggle}
                    sx={{ px: 4, borderRadius: 3, fontWeight: 800, minWidth: 120 }}
                  >
                    {profile.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mb: 3, maxWidth: 650, mx: { xs: 'auto', md: 0 }, fontSize: '1.15rem', lineHeight: 1.6 }}>
              {profile.bio || 'Passion for good food and community. Sharing my culinary journey one recipe at a time! 🍳✨'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: { xs: 2.5, md: 4 }, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Box className="glass" sx={{ p: '12px 24px', borderRadius: 4, textAlign: 'center', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{profile.followerCount}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Followers</Typography>
              </Box>
              <Box className="glass" sx={{ p: '12px 24px', borderRadius: 4, textAlign: 'center', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{profile.followingCount}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Following</Typography>
              </Box>
              <Box className="glass" sx={{ p: '12px 24px', borderRadius: 4, textAlign: 'center', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{recipes.length}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipes</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ p: 0.5, borderRadius: 4, bgcolor: '#f1f5f9', display: 'inline-flex' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, val) => setActiveTab(val)} 
            sx={{ 
              minHeight: 0,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': { 
                minHeight: 44, 
                px: { xs: 3, sm: 6 }, 
                borderRadius: 3.5, 
                fontSize: '0.95rem', 
                fontWeight: 800,
                color: 'text.secondary',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': { 
                  color: 'white', 
                  bgcolor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' 
                }
              }
            }}
          >
            <Tab label="Collection" disableRipple />
            <Tab label="Appreciated" disableRipple />
          </Tabs>
        </Paper>
      </Box>

      {recipesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress thickness={5} sx={{ color: 'primary.main' }} /></Box>
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
            gap: { xs: 3, md: 4 } 
          }}
        >
          {recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <Box 
                key={recipe.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 80}ms`, transition: 'transform 0.3s' }}
                sx={{ '&:hover': { transform: 'translateY(-8px)' } }}
              >
                <RecipeCard recipe={recipe} onLike={() => { /* Handle like */ }} />
              </Box>
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 15, bgcolor: alpha('#f8fafc', 0.8), borderRadius: 8, border: '2px dashed #e2e8f0' }}>
              <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 800, mb: 1.5 }}>
                {activeTab === 0 ? "Your culinary gallery is empty" : "No appreciated works yet"}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400, mx: 'auto' }}>
                Join the conversation and start sharing your unique recipes with food lovers worldwide.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/feed')}
                sx={{ borderRadius: 4, px: 5, py: 1.5, fontWeight: 800 }}
              >
                Discover Inspiration
              </Button>
            </Box>
          )}
        </Box>
      )}

      {profile && (
        <EditProfileModal 
          open={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          profile={profile}
        />
      )}
    </Container>
  );
};

export default ProfilePage;

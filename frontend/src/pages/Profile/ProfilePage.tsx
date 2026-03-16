import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, Box, Typography, Avatar, Button, 
  Paper, Tabs, Tab, CircularProgress, 
  Alert 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { AppDispatch, RootState } from '../../store/store';
import { getProfileThunk, followUserThunk, unfollowUserThunk } from '../../features/user/userThunks';
import { recipeService } from '../../services/recipe.service';
import type { RecipeSummary } from '../../services/recipe.service';
import RecipeCard from '../../components/recipes/RecipeCard';
import { useAuth } from '../../hooks/useAuth';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useAuth();
  const { profile, loading, error } = useSelector((state: RootState) => state.user);
  
  const [activeTab, setActiveTab] = useState(0);
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);

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
        setRecipes(data.content);
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 4, mb: 6, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: 120, 
          background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-end' }, gap: 3, mt: 4 }}>
          <Avatar 
            src={profile.profilePictureUrl} 
            sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {profile.username[0].toUpperCase()}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" fontWeight={800}>{profile.username}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>{profile.bio || 'No bio yet.'}</Typography>
            
            <Box sx={{ display: 'flex', gap: 3, justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>{profile.followerCount}</Typography>
                <Typography variant="caption" color="text.secondary">Followers</Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>{profile.followingCount}</Typography>
                <Typography variant="caption" color="text.secondary">Following</Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>{activeTab === 0 ? recipes.length : '?'}</Typography>
                <Typography variant="caption" color="text.secondary">Recipes</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 1 }}>
            {isOwnProfile ? (
              <Button variant="outlined" startIcon={<EditIcon />}>Edit Profile</Button>
            ) : (
              <Button 
                variant={profile.isFollowing ? "outlined" : "contained"} 
                onClick={handleFollowToggle}
                sx={{ px: 4, borderRadius: 2 }}
              >
                {profile.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} centered>
          <Tab label="My Recipes" sx={{ fontWeight: 700 }} />
          <Tab label="Liked Recipes" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {recipesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr'
            },
            gap: 4 
          }}
        >
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 10 }}>
              <Typography color="text.secondary" variant="h6">
                No recipes to show here yet.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ProfilePage;

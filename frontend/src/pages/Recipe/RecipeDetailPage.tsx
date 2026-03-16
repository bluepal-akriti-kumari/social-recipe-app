import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, Grid, Box, Typography, Avatar, 
  List, ListItem, ListItemText, ListItemIcon, 
  Paper, IconButton, TextField, Button, CircularProgress, 
  Alert, alpha
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useAuth } from '../../hooks/useAuth';
import type { AppDispatch, RootState } from '../../store/store';
import { 
  getRecipeByIdThunk, likeRecipeThunk, 
  getCommentsThunk, addCommentThunk 
} from '../../features/recipes/recipeThunks';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useAuth();
  const { recipeDetail, comments, loading, error } = useSelector((state: RootState) => state.recipes);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: number; username: string } | null>(null);

  useEffect(() => {
    if (id) {
      const recipeId = parseInt(id);
      dispatch(getRecipeByIdThunk(recipeId));
      dispatch(getCommentsThunk(recipeId));
    }
  }, [id, dispatch]);

  const handleLike = () => {
    if (recipeDetail) dispatch(likeRecipeThunk(recipeDetail.id));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && recipeDetail) {
      dispatch(addCommentThunk(recipeDetail.id, commentText, replyingTo?.id));
      setCommentText('');
      setReplyingTo(null);
    }
  };

  if (loading && !recipeDetail) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  if (error || !recipeDetail) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">{error || 'Recipe not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 4, borderRadius: 3, fontWeight: 700, color: 'text.secondary' }}
      >
        Back to discovery
      </Button>
      
      <Grid container spacing={6}>
        {/* Left Column: Image and Main Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ position: 'relative', mb: 6 }}>
            <Box 
              component="img" 
              src={recipeDetail.imageUrl || 'https://via.placeholder.com/800x600'} 
              sx={{ 
                width: '100%', 
                aspectRatio: '16/9',
                objectFit: 'cover',
                borderRadius: 6, 
                boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
              }}
            />
            <Box 
              sx={{ 
                position: 'absolute', top: 20, right: 20,
                display: 'flex', gap: 1
              }}
            >
              <IconButton 
                size="large"
                sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f1f5f9' }, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <BookmarkBorderIcon />
              </IconButton>
              <IconButton 
                size="large"
                sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f1f5f9' }, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <ShareIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {recipeDetail.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, p: 3, bgcolor: 'white', borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <Avatar 
              src={recipeDetail.author.profilePictureUrl} 
              sx={{ width: 56, height: 56, cursor: 'pointer', mr: 2, border: '2px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              onClick={() => navigate(`/profile/${recipeDetail.author.username}`)}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => navigate(`/profile/${recipeDetail.author.username}`)}>
                {recipeDetail.author.username}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Chef & Food Enthusiast • {new Date(recipeDetail.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, pr: 2, borderRadius: 5, bgcolor: recipeDetail.isLiked ? 'primary.light' : '#f1f5f9' }}>
              <IconButton onClick={handleLike} color={recipeDetail.isLiked ? 'primary' : 'default'} sx={{ transition: 'all 0.3s' }}>
                {recipeDetail.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography sx={{ fontWeight: 800, color: recipeDetail.isLiked ? 'primary.main' : 'text.primary' }}>
                {recipeDetail.likeCount}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <DescriptionIcon sx={{ color: 'primary.main' }} /> The Story
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
              {recipeDetail.description}
            </Typography>
          </Box>

          {/* Social Section */}
          <Box id="comments" sx={{ mt: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Comments ({recipeDetail.commentCount})</Typography>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)', mb: 4, bgcolor: '#f8fafc' }}>
              <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {replyingTo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.light', p: 1.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 700 }}>Replying to <b>@{replyingTo.username}</b></Typography>
                    <Button size="small" variant="text" color="primary" sx={{ p: 0, minWidth: 0 }} onClick={() => setReplyingTo(null)}>Cancel</Button>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar src={(currentUser as any)?.profilePictureUrl} sx={{ width: 40, height: 40 }} />
                  <TextField 
                    fullWidth 
                    multiline
                    rows={2}
                    placeholder={replyingTo ? "Write a thoughtful reply..." : "What do you think of this recipe?"} 
                    variant="outlined"
                    value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' }
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" endIcon={<SendIcon />} sx={{ borderRadius: 3, px: 4 }}>
                    Post Comment
                  </Button>
                </Box>
              </Box>
            </Paper>
            
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {comments.map((comment, index) => (
                <Box key={comment.id || index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.5)', ml: comment.parentId ? 6 : 0, bgcolor: comment.parentId ? alpha('#f8fafc', 0.5) : 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar src={comment.userProfilePictureUrl} sx={{ width: 40, height: 40, cursor: 'pointer' }} onClick={() => navigate(`/profile/${comment.username}`)} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }} onClick={() => navigate(`/profile/${comment.username}`)}>
                            {comment.username}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, mb: 1.5 }}>
                          {comment.content}
                        </Typography>
                        <Button 
                          size="small" 
                          startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: '16px !important' }} />}
                          sx={{ p: 0, minWidth: 0, color: 'text.secondary', fontWeight: 700, textTransform: 'none', '&:hover': { color: 'primary.main' } }} 
                          onClick={() => setReplyingTo({ id: comment.id, username: comment.username })}
                        >
                          Reply
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              ))}
            </List>
          </Box>
        </Grid>

        {/* Right Column: Cooking Stats & Ingredients */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Paper sx={{ p: 4, borderRadius: 6, mb: 4, bgcolor: 'white', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Cooking Details</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 4, bgcolor: '#fff5f5', border: '1px solid #fee2e2' }}>
                    <AccessTimeIcon sx={{ color: 'primary.main', mb: 1 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>TIME</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>
                      {Number(recipeDetail.prepTimeMinutes) + Number(recipeDetail.cookTimeMinutes)} mins
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ p: 2, borderRadius: 4, bgcolor: '#f0fdf4', border: '1px solid #d1fae5' }}>
                    <RestaurantIcon sx={{ color: 'secondary.main', mb: 1 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>SERVINGS</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>{recipeDetail.servings} people</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 6, mb: 4, bgcolor: 'white', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                Ingredients
              </Typography>
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recipeDetail.ingredients.map((ing) => (
                  <ListItem key={ing.id} sx={{ px: 0, py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontWeight: 600 }}>{ing.name}</Typography>
                          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>{ing.quantity} {ing.unit || ''}</Typography>
                        </Box>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, px: 1 }}>Instructions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[...recipeDetail.steps].sort((a, b) => Number(a.stepNumber) - Number(b.stepNumber)).map((step, index) => (
                <Box key={step.id} sx={{ display: 'flex', gap: 3, p: 3, borderRadius: 4, bgcolor: 'white', border: '1px solid rgba(226, 232, 240, 0.8)', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)', borderColor: 'primary.light' } }}>
                  <Box sx={{ 
                    minWidth: 36, height: 36, borderRadius: '12px', 
                    bgcolor: 'primary.main', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}>
                    {index + 1}
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6, color: 'text.primary' }}>
                    {step.instruction}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecipeDetailPage;

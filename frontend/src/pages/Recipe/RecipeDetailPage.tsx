import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, Grid, Box, Typography, Avatar, Divider, 
  List, ListItem, ListItemText, ListItemIcon, 
  Paper, IconButton, TextField, Button, CircularProgress, 
  Alert 
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import type { AppDispatch, RootState } from '../../store/store';
import { 
  getRecipeByIdThunk, likeRecipeThunk, 
  getCommentsThunk, addCommentThunk 
} from '../../features/recipes/recipeThunks';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4 }}>Back</Button>
      
      <Grid container spacing={6}>
        {/* Left Column: Image and Description */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box 
            component="img" src={recipeDetail.imageUrl || 'https://via.placeholder.com/800x600'} 
            sx={{ width: '100%', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', mb: 4 }}
          />
          
          <Typography variant="h3" fontWeight={800} gutterBottom>{recipeDetail.title}</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Avatar 
              src={recipeDetail.author.profilePictureUrl} 
              sx={{ width: 48, height: 48, cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${recipeDetail.author.username}`)}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${recipeDetail.author.username}`)}>
                {recipeDetail.author.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Published on {new Date(recipeDetail.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleLike} color={recipeDetail.isLiked ? 'error' : 'default'}>
                {recipeDetail.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography fontWeight={600}>{recipeDetail.likeCount}</Typography>
            </Box>
          </Box>

          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#f8fafc', mb: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Description</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{recipeDetail.description}</Typography>
          </Paper>

          {/* Social Section */}
          <Box id="comments">
            <Typography variant="h5" fontWeight={700} gutterBottom>Comments ({recipeDetail.commentCount})</Typography>
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4, mt: 2 }}>
              {replyingTo && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f1f5f9', p: 1, borderRadius: 1 }}>
                  <Typography variant="caption">Replying to <b>@{replyingTo.username}</b></Typography>
                  <Button size="small" onClick={() => setReplyingTo(null)}>Cancel</Button>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  fullWidth placeholder={replyingTo ? "Write a reply..." : "Add a comment..."} 
                  variant="outlined" size="small"
                  value={commentText} onChange={(e) => setCommentText(e.target.value)}
                />
                <Button type="submit" variant="contained" endIcon={<SendIcon />}>Post</Button>
              </Box>
            </Box>
            
            <List>
              {comments.map((comment, index) => (
                <Box key={comment.id || index}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar src={comment.userProfilePictureUrl} sx={{ width: 32, height: 32 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography fontWeight={700} variant="body2">
                            {comment.username} {comment.parentId && <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>replied</Box>}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>{comment.content}</Typography>
                          <Button 
                            size="small" 
                            sx={{ minWidth: 0, p: 0, mt: 0.5, textTransform: 'none' }} 
                            onClick={() => setReplyingTo({ id: comment.id, username: comment.username })}
                          >
                            Reply
                          </Button>
                        </Box>
                      }
                      sx={{ ml: comment.parentId ? 4 : 0 }}
                    />
                  </ListItem>
                  {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              ))}
            </List>
          </Box>
        </Grid>

        {/* Right Column: Details and Ingredients */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4, bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Cook Time</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {Number(recipeDetail.prepTimeMinutes) + Number(recipeDetail.cookTimeMinutes)} mins
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RestaurantIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Servings</Typography>
                    <Typography variant="body2" fontWeight={700}>{recipeDetail.servings} people</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="h5" fontWeight={700} gutterBottom>Ingredients</Typography>
          <List sx={{ mb: 4 }}>
            {recipeDetail.ingredients.map((ing) => (
              <ListItem key={ing.id} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} /></ListItemIcon>
                <ListItemText primary={`${ing.quantity} ${ing.unit || ''} ${ing.name}`} />
              </ListItem>
            ))}
          </List>

          <Typography variant="h5" fontWeight={700} gutterBottom>Instructions</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {[...recipeDetail.steps].sort((a, b) => Number(a.stepNumber) - Number(b.stepNumber)).map((step) => (
              <Box key={step.id} sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ 
                  minWidth: 28, height: 28, borderRadius: '50%', 
                  bgcolor: 'primary.main', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, mt: 0.5
                }}>
                  {step.stepNumber}
                </Box>
                <Typography variant="body1">{step.instruction}</Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecipeDetailPage;

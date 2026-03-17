import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Box, Typography, Avatar, 
  List, ListItem, ListItemText, ListItemIcon, 
  Paper, IconButton, TextField, Button, CircularProgress, 
  Alert, alpha, Stack
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import DescriptionIcon from '@mui/icons-material/Description';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { recipeService } from '../../services/recipe.service';
import { shoppingListService } from '../../services/shoppingList.service';
import AddToPlannerModal from './AddToPlannerModal';
import { toast } from 'react-hot-toast';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  const recipeId = parseInt(id || '0');
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: number; username: string } | null>(null);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // --- Data Fetching (UseQuery) ---
  const { 
    data: recipeDetail, 
    isLoading: isRecipeLoading, 
    error: recipeError 
  } = useQuery({
    queryKey: ['recipes', recipeId],
    queryFn: () => recipeService.getRecipeById(recipeId),
    enabled: !!recipeId && !isNaN(recipeId),
  });

  const { 
    data: comments = [], 
    isLoading: isCommentsLoading 
  } = useQuery({
    queryKey: ['recipes', recipeId, 'comments'],
    queryFn: () => recipeService.getComments(recipeId).then(res => res.content),
    enabled: !!recipeId && !isNaN(recipeId),
  });

  // --- Mutations ---
  const likeMutation = useMutation({
    mutationFn: () => recipeService.likeRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => recipeService.addComment(recipeId, text, replyingTo?.id),
    onSuccess: () => {
      setCommentText('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['recipes', recipeId, 'comments'] });
      toast.success('Comment posted!');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => recipeService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', recipeId, 'comments'] });
      toast.success('Comment deleted');
    },
  });

  const addToShoppingMutation = useMutation({
    mutationFn: () => shoppingListService.addFromRecipe(recipeId),
    onSuccess: () => toast.success('All ingredients added to your shopping list!'),
    onError: () => toast.error('Failed to add ingredients'),
  });

  // --- Handlers ---
  const handleLike = () => likeMutation.mutate();
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) addCommentMutation.mutate(commentText);
  };

  const handleAddToShopping = async () => {
    if (!recipeDetail) return;
    addToShoppingMutation.mutate();
  };

  const handleDeleteComment = async (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  // Image logic
  const displayImage = activeImage || recipeDetail?.imageUrl;

  if (isRecipeLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  if (recipeError || !recipeDetail) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">{(recipeError as any)?.message || 'Recipe not found'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>Back</Button>
      </Container>
    );
  }

  return (
    <Box className="bg-mesh" sx={{ minHeight: '100vh', py: { xs: 4, md: 10 } }}>
      <Container maxWidth="lg">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ 
            mb: 2, 
            borderRadius: '8px', 
            fontWeight: 800, 
            color: 'text.secondary',
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', color: 'primary.main' }
          }}
        >
          Back to discovery
        </Button>
        
        <Grid container spacing={6}>
          {/* Left Column: Image and Main Info */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ position: 'relative', mb: 6 }}>
              <Box 
                component="img" 
                src={displayImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80'} 
                sx={{ 
                  width: '100%', 
                  aspectRatio: '16/9',
                  objectFit: 'cover',
                  borderRadius: '16px', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.5s ease-in-out'
                }}
              />
              
              {/* Additional Images Thumbnails */}
              {recipeDetail.additionalImages && recipeDetail.additionalImages.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                  <Box 
                    onClick={() => setActiveImage(recipeDetail.imageUrl)}
                    sx={{ 
                      width: 80, height: 80, borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                      border: activeImage === recipeDetail.imageUrl ? '3px solid #6366f1' : '1px solid rgba(0,0,0,0.1)',
                      opacity: activeImage === recipeDetail.imageUrl ? 1 : 0.6,
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={recipeDetail.imageUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  {recipeDetail.additionalImages.map((img, idx) => (
                    <Box 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      sx={{ 
                        width: 80, height: 80, borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                        border: activeImage === img ? '3px solid #6366f1' : '1px solid rgba(0,0,0,0.1)',
                        opacity: activeImage === img ? 1 : 0.6,
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={img} alt={`Additional ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Box>
              )}

              <Box 
                sx={{ 
                  position: 'absolute', top: 24, right: 24,
                  display: 'flex', gap: 2
                }}
              >
                <IconButton 
                  size="large"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.8)', 
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    '&:hover': { bgcolor: 'white', transform: 'translateY(-2px)' } 
                  }}
                >
                  <BookmarkBorderIcon />
                </IconButton>
                <IconButton 
                  size="large"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.8)', 
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    '&:hover': { bgcolor: 'white', transform: 'translateY(-2px)' } 
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Typography variant="h1" sx={{ fontWeight: 950, mb: 3, letterSpacing: '-0.04em', lineHeight: 1, fontSize: { xs: '2.5rem', md: '4.5rem' } }}>
              {recipeDetail.title}
            </Typography>
            {currentUser && recipeDetail.author.username === (currentUser as any).username && (
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => navigate(`/recipes/${recipeDetail.id}/edit`)}
                  sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 800, mr: 1 }}
                >
                  Edit Recipe
                </Button>
              </Box>
            )}
            
            <Box 
              className="glass-card"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 6, 
                p: 2, 
                borderRadius: '12px',
              }}
            >
              <Avatar 
                src={recipeDetail.author.profilePictureUrl} 
                sx={{ width: 64, height: 64, cursor: 'pointer', mr: 2.5, border: '3px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                onClick={() => navigate(`/profile/${recipeDetail.author.username}`)}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { color: 'primary.main' } }} onClick={() => navigate(`/profile/${recipeDetail.author.username}`)}>
                  {recipeDetail.author.username}
                  {recipeDetail.author.isVerified && <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Master Chef • {new Date(recipeDetail.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5, 
                  px: 2, 
                  borderRadius: '8px', 
                  bgcolor: recipeDetail.isLiked ? 'rgba(244, 63, 94, 0.1)' : 'rgba(0,0,0,0.03)',
                  transition: 'all 0.3s ease'
                }}
              >
                <IconButton 
                  onClick={handleLike} 
                  sx={{ 
                    color: recipeDetail.isLiked ? 'secondary.main' : 'text.disabled',
                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': { transform: 'scale(1.2)' }
                  }}
                >
                  {recipeDetail.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography sx={{ fontWeight: 900, color: recipeDetail.isLiked ? 'secondary.main' : 'text.primary', ml: 1 }}>
                  {recipeDetail.likeCount}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 8 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '-0.02em' }}>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'primary.light', display: 'flex' }}>
                  <DescriptionIcon sx={{ color: 'primary.main' }} />
                </Box>
                Culinary Story
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 2, fontSize: '1.2rem', fontWeight: 500, letterSpacing: '0.01em' }}>
                {recipeDetail.description}
              </Typography>
            </Box>

            {/* Social Section */}
            <Box id="comments" sx={{ mt: 10 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em' }}>
                  Community Talk <span style={{ color: alpha('#6366f1', 0.5), fontSize: '1.5rem' }}>({recipeDetail.commentCount})</span>
                </Typography>
              </Box>

              <Paper className="glass" sx={{ p: 3, borderRadius: '12px', mb: 4 }}>
                <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {replyingTo && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha('#6366f1', 0.1), p: 1.5, borderRadius: '10px' }}>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>Replying to <b>@{replyingTo.username}</b></Typography>
                      <Button size="small" variant="text" color="primary" sx={{ p: 0, minWidth: 0, fontWeight: 800 }} onClick={() => setReplyingTo(null)}>Cancel</Button>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 2.5 }}>
                    <Avatar 
                      src={(currentUser as any)?.profilePictureUrl} 
                      sx={{ width: 48, height: 48, border: '2px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    />
                    <TextField 
                      fullWidth 
                      multiline
                      rows={3}
                      placeholder={replyingTo ? "Write a thoughtful reply..." : "Share your thoughts on this culinary masterpiece..."} 
                      variant="outlined"
                      value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '8px', 
                          bgcolor: 'white',
                          fontWeight: 500,
                          '& fieldset': { borderColor: 'rgba(0,0,0,0.05)' },
                          '&:hover fieldset': { borderColor: 'primary.light' }
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      endIcon={<SendIcon />} 
                      sx={{ 
                        borderRadius: '14px', 
                        px: 5, 
                        py: 1.5, 
                        fontWeight: 900,
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                      }}
                    >
                      Post Thought
                    </Button>
                  </Box>
                </Box>
              </Paper>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {comments.map((comment, index) => (
                  <motion.div 
                    key={comment.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2.5, 
                        borderRadius: '12px', 
                        border: '1px solid rgba(0,0,0,0.03)', 
                        ml: comment.parentId ? 6 : 0, 
                        bgcolor: comment.parentId ? 'rgba(0,0,0,0.015)' : 'white',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'translateX(8px)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                        <Avatar 
                          src={comment.userProfilePictureUrl} 
                          sx={{ width: 44, height: 44, border: '2px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }} 
                          onClick={() => navigate(`/profile/${comment.username}`)} 
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ fontWeight: 900, fontSize: '1rem', cursor: 'pointer' }} onClick={() => navigate(`/profile/${comment.username}`)}>
                              {comment.username}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.8, mb: 2, fontSize: '1rem', fontWeight: 500 }}>
                            {comment.content}
                          </Typography>
                          <Button 
                            size="small" 
                            startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: '18px !important' }} />}
                            sx={{ p: 0, minWidth: 0, color: 'primary.main', fontWeight: 800, textTransform: 'none', '&:hover': { opacity: 0.8 } }} 
                            onClick={() => setReplyingTo({ id: comment.id, username: comment.username })}
                          >
                            Reply
                          </Button>
                          {currentUser && (currentUser as any).username === comment.username && (
                            <Button 
                              size="small" 
                              startIcon={deleteCommentMutation.isPending && deleteCommentMutation.variables === comment.id ? <CircularProgress size={14} /> : <DeleteOutlineIcon sx={{ fontSize: '18px !important' }} />}
                              sx={{ p: 0, minWidth: 0, color: 'error.main', fontWeight: 800, textTransform: 'none', ml: 2, '&:hover': { opacity: 0.8 } }}
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                            >
                              Delete
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Cooking Stats & Ingredients */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 120 }}>
              <Paper 
                className="glass-card"
                sx={{ p: 3, borderRadius: '16px', mb: 3 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.02em' }}>Kitchen Briefing</Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                      <AccessTimeIcon sx={{ color: 'primary.main', mb: 1.5, fontSize: 28 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>DURATION</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 950 }}>
                        {Number(recipeDetail.prepTimeMinutes) + Number(recipeDetail.cookTimeMinutes)} min
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                      <RestaurantIcon sx={{ color: 'secondary.main', mb: 1.5, fontSize: 28 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>PORTIONS</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 950 }}>{recipeDetail.servings} people</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Paper 
                className="glass-card"
                sx={{ p: 3, borderRadius: '16px', mb: 4 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 8, height: 24, borderRadius: 4, bgcolor: 'primary.main' }} />
                  Inventory Needed
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<ShoppingBasketIcon />}
                    onClick={() => addToShoppingMutation.mutate()}
                    disabled={addToShoppingMutation.isPending}
                    sx={{ borderRadius: '8px', py: 1, fontWeight: 900 }}
                  >
                    {addToShoppingMutation.isPending ? 'Adding...' : 'Add All to Shopping List'}
                  </Button>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<CalendarMonthIcon />}
                    onClick={() => setIsPlannerOpen(true)}
                    sx={{ borderRadius: '8px', py: 1, fontWeight: 900 }}
                  >
                    Add to Meal Planner
                  </Button>
                </Stack>

                <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recipeDetail.ingredients.map((ing) => (
                    <ListItem key={ing.id} sx={{ px: 0, py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0 0 0 5px rgba(99, 102, 241, 0.1)' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{ing.name}</Typography>
                            <Typography sx={{ color: 'primary.main', fontWeight: 950, bgcolor: 'rgba(99, 102, 241, 0.08)', px: 1.5, py: 0.5, borderRadius: '10px', fontSize: '0.9rem' }}>
                              {ing.quantity} {ing.unit || ''}
                            </Typography>
                          </Box>
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>

              <Typography variant="h5" sx={{ fontWeight: 950, mb: 4, px: 2, letterSpacing: '-0.02em' }}>The Process</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {[...recipeDetail.steps].sort((a, b) => Number(a.stepNumber) - Number(b.stepNumber)).map((step, index) => (
                  <Box 
                    key={step.id} 
                    sx={{ 
                      display: 'flex', 
                      gap: 3, 
                      p: 4, 
                      borderRadius: '24px', 
                      bgcolor: 'white', 
                      border: '1px solid rgba(0,0,0,0.03)', 
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                      '&:hover': { 
                        transform: 'scale(1.05) translateX(10px)', 
                        borderColor: 'primary.light',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                      } 
                    }}
                  >
                    <Box sx={{ 
                      minWidth: 36, height: 36, borderRadius: '8px', 
                      bgcolor: 'primary.main', color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 950, fontSize: '1.1rem', boxShadow: '0 4px 8px rgba(99, 102, 241, 0.2)'
                    }}>
                      {index + 1}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.8, color: 'text.primary', fontSize: '1.05rem' }}>
                      {step.instruction}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {recipeDetail && (
        <AddToPlannerModal 
          open={isPlannerOpen} 
          onClose={() => setIsPlannerOpen(false)}
          recipeId={recipeDetail.id}
          recipeTitle={recipeDetail.title}
        />
      )}
    </Box>
  );
};

export default RecipeDetailPage;

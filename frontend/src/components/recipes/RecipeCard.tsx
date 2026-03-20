import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardContent, CardMedia, Typography, 
  Box, Avatar, IconButton, Chip 
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '../../hooks/useAuth';
import AddToPlannerModal from '../../pages/Recipe/AddToPlannerModal';
import type { RecipeSummary } from '../../services/recipe.service';

interface RecipeCardProps {
  recipe: RecipeSummary;
  onLike?: (id: number) => void;
  onBookmark?: (id: number) => void;
}

const RecipeCard = ({ recipe, onLike, onBookmark }: RecipeCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  const handleInteraction = (e: React.MouseEvent, callback?: (id: number) => void) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    callback?.(recipe.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 1.25,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: '1px solid #EAECEE',
          transition: 'all 0.3s ease',
          '&:hover': { 
            boxShadow: '0 8px 24px rgba(44, 62, 80, 0.08)',
            borderColor: '#D5D8DC',
            '& .card-media': { transform: 'scale(1.05)' }
          }
        }}
      >
        {/* Media Section */}
        <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            className="card-media"
            image={recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80'}
            alt={recipe.title}
            sx={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              transition: 'transform 0.5s ease', cursor: 'pointer',
              objectFit: 'cover'
            }}
            onClick={() => navigate(`/recipes/${recipe.id}`)}
          />
          
          {/* Overlay for Time */}
          <Box sx={{ 
            position: 'absolute', top: 12, left: 12,
            bgcolor: '#000000',
            color: 'white',
            px: 1, py: 0.3, borderRadius: '8px', zIndex: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: 0.75,
          }}>
            <AccessTimeIcon sx={{ fontSize: 14, color: 'white' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'white' }}>
              {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)}m
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => handleInteraction(e, onBookmark)}
            sx={{ 
              position: 'absolute', top: 12, right: 12,
              bgcolor: 'rgba(255,255,255,0.9)', 
              '&:hover': { bgcolor: 'white' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              color: recipe.isBookmarked ? 'primary.main' : 'inherit'
            }}
          >
            {recipe.isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) return navigate('/login');
              setIsPlannerOpen(true);
            }}
            sx={{ 
              position: 'absolute', top: 50, right: 12,
              bgcolor: 'rgba(255,255,255,0.9)', 
              '&:hover': { bgcolor: 'white' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              color: 'primary.main'
            }}
          >
            <CalendarMonthIcon fontSize="small" />
          </IconButton>
        </Box>

        <CardContent sx={{ p: 2, pb: '16px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Author */}
          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              src={recipe.author?.profilePictureUrl} 
              sx={{ width: 22, height: 22, border: '1px solid #eee' }}
            >
              {recipe.author?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {recipe.author?.username}
              {recipe.author?.isVerified && <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
            </Typography>
          </Box>

          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              lineHeight: 1.3,
              mb: 1,
              minHeight: '2.6em', // Space for exactly 2 lines (1.3 line-height * 2)
              fontSize: '1.1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
              color: 'primary.main',
              '&:hover': { color: 'secondary.main' }
            }}
            onClick={() => navigate(`/recipes/${recipe.id}`)}
          >
            {recipe.title}
          </Typography>

          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              mb: 2,
              display: '-webkit-box',
              minHeight: '3em', 
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.85rem',
              lineHeight: 1.5
            }}
          >
            {recipe.description}
          </Typography>

          <Box sx={{ mt: 'auto', pt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  onClick={(e) => handleInteraction(e, onLike)}
                  sx={{ 
                    p: 0,
                    color: recipe.isLiked ? 'secondary.main' : 'text.disabled',
                    '&:hover': { color: 'secondary.main' }
                  }}
                >
                  {recipe.isLiked ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
                </IconButton>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {recipe.likeCount}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled' }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {recipe.commentCount}
                </Typography>
              </Box>
            </Box>
            
            <Chip 
              label={recipe.category || 'Expert'} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.65rem', 
                fontWeight: 700,
                bgcolor: '#F2F4F4',
                color: 'primary.main',
                borderRadius: 1
              }} 
            />
          </Box>
        </CardContent>
      </Card>

      <AddToPlannerModal 
        open={isPlannerOpen} 
        onClose={() => setIsPlannerOpen(false)}
        recipeId={recipe.id}
        recipeTitle={recipe.title}
      />
    </motion.div>
  );
};

export default RecipeCard;
